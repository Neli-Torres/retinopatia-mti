// ---------------------------------------------
// ANALIZAR OJOS — CORREGIDO COMPLETO
// ---------------------------------------------

async function analizarImagen(base64Img) {
    const url = "https://mti-clasificacion.onrender.com/clasificar-imagen";

    const formData = new FormData();

    // Convertir base64 a Blob
    const blob = await fetch(base64Img).then(res => res.blob());
    formData.append("imagen", blob, "imagen_base64.jpg");

    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Error en la respuesta del servidor");
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("❌ Error al analizar imagen:", error);
        throw error;
    }
}


// ---------------------------------------------
// FUNCIÓN PRINCIPAL — BOTÓN “ANALIZAR OJOS”
// ---------------------------------------------

document.getElementById("btnAnalizar").addEventListener("click", async () => {
    try {
        actualizarProgreso(30);  // ya validaste imágenes

        const imgDerecho = localStorage.getItem("url_ojo_derecho");
        const imgIzquierdo = localStorage.getItem("url_ojo_izquierdo");

        if (!imgDerecho || !imgIzquierdo) {
            alert("Debes cargar ambas imágenes antes de analizar.");
            return;
        }

        actualizarProgreso(40);

        // Clasificar ojo derecho
        const resultadoDerecho = await analizarImagen(imgDerecho);
        console.log("➡ Resultado derecho:", resultadoDerecho);
        actualizarProgreso(60);

        // Clasificar ojo izquierdo
        const resultadoIzquierdo = await analizarImagen(imgIzquierdo);
        console.log("➡ Resultado izquierdo:", resultadoIzquierdo);
        actualizarProgreso(90);

        // Guardar resultados
        localStorage.setItem("resultado_derecho", JSON.stringify(resultadoDerecho));
        localStorage.setItem("resultado_izquierdo", JSON.stringify(resultadoIzquierdo));

        actualizarProgreso(100);

        alert("✔ Análisis completado.");
        window.location.href = "pantalla_4.html";

    } catch (error) {
        alert("❌ Error durante el análisis: " + error);
        actualizarProgreso(0);
    }
});


// ---------------------------------------------
// FUNCIÓN DE PROGRESO EN PANTALLA
// ---------------------------------------------

function actualizarProgreso(valor) {
    const barra = document.getElementById("avancePorcentaje");
    barra.textContent = valor + "%";
}

});
