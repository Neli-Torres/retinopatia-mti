document.getElementById("btnAnalizar").addEventListener("click", async function (e) {
  e.preventDefault();

  const idPaciente = localStorage.getItem("id_paciente");
  if (!idPaciente) {
    alert("❌ No se encontró el ID del paciente.");
    return;
  }

  const supabase = window.supabase.createClient(
    "https://yqsasvrqzlqrgtywddmo.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc2FzdnJxemxxcmd0eXdkZG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDc3NDksImV4cCI6MjA2NDIyMzc0OX0.uQbaJnZExdU1_Ay_Sk-1KiiIcdNgUD3dSlsWGgiYc-M"
  );

  // Obtener imágenes guardadas
  const { data, error } = await supabase
    .from("formulario_pacientes")
    .select("url_ojo_derecho, url_ojo_izquierdo")
    .eq("id", idPaciente)
    .single();

  if (error || !data) {
    alert("❌ No se pudieron recuperar las imágenes para analizar.");
    console.error(error);
    return;
  }

  const progreso = document.getElementById("progreso");
  progreso.textContent = "30%";

  async function analizarImagen(base64, tipo) {
    const formData = new FormData();

    // Convertir base64 a Blob
    const blob = await fetch(base64).then(res => res.blob());
    formData.append("imagen", blob, tipo + ".png");

    // 🔥🔥🔥 URL FINAL DEL BACKEND EN PRODUCCIÓN (Render)
    const respuesta = await fetch("https://mti-clasificacion.onrender.com/clasificar-retinopatia", {
      method: "POST",
      body: formData
    });

    if (!respuesta.ok) {
      const errorData = await respuesta.json().catch(() => ({}));
      throw new Error(errorData.error || "Error al clasificar la imagen.");
    }

    const resultado = await respuesta.json();
    return resultado.clasificacion;
  }

  try {
    // Analizar ojo derecho
    const clasificacionDerecho = await analizarImagen(data.url_ojo_derecho, "ojo_derecho");
    progreso.textContent = "60%";

    // Analizar ojo izquierdo
    const clasificacionIzquierdo = await analizarImagen(data.url_ojo_izquierdo, "ojo_izquierdo");
    progreso.textContent = "80%";

    // Guardar resultados en Supabase
    const { error: updateError } = await supabase
      .from("formulario_pacientes")
      .update({
        resultado_derecho: clasificacionDerecho,
        resultado_izquierdo: clasificacionIzquierdo
      })
      .eq("id", idPaciente);

    if (updateError) {
      alert("❌ Error al guardar los diagnósticos.");
      console.error(updateError);
      return;
    }

    // Mostrar en pantalla
    document.getElementById("resultado_derecho").textContent = clasificacionDerecho;
    document.getElementById("resultado_izquierdo").textContent = clasificacionIzquierdo;
    document.getElementById("resultados").classList.remove("hidden");
    document.getElementById("descargaPDF").classList.remove("hidden");
    document.getElementById("noListo").style.display = "none";

    progreso.textContent = "100%";

    alert("✅ Análisis completado y guardado exitosamente.");

  } catch (err) {
    alert("❌ Error durante el análisis: " + err.message);
    console.error(err);
  }
});
