const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Endpoint para extraer metadatos
app.get('/x', async (req, res) => {
  const url = req.query.url;

  // Validar que se proporcione una URL
  if (!url) {
    return res.status(400).json({
      error: 'Falta el parámetro "url" en la solicitud'
    });
  }

  try {
    // Obtener la página web
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Parsear HTML con cheerio
    const $ = cheerio.load(response.data);

    // Extraer metadatos JSON-LD
    const jsonLdScript = $('script[type="application/ld+json"]').html();
    if (!jsonLdScript) {
      return res.status(404).json({
        error: 'Error en la búsqueda o descarga'
      });
    }

    // Parsear JSON-LD
    const metadata = JSON.parse(jsonLdScript);

    // Extraer campos requeridos
    const videoData = {
      name: metadata.name || 'Título desconocido',
      description: metadata.description || 'Sin descripción disponible',
      thumbnailUrl: metadata.thumbnailUrl ? metadata.thumbnailUrl : [],
      uploadDate: metadata.uploadDate || 'Fecha desconocida',
      duration: metadata.duration || 'Duración desconocida',
      contentUrl: metadata.contentUrl || null
    };

    // Devolver los metadatos en el mismo formato que el HTML
    res.status(200).json(videoData);
  } catch (error) {
    res.status(500).json({
      error: 'Error en la búsqueda o descarga',
      detalle: error.message
    });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor API corriendo en http://localhost:${port}`);
});
