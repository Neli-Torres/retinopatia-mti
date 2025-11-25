const { jsPDF } = window.jspdf;

document.getElementById("btnPDF").addEventListener("click", async function (e) {
  e.preventDefault();

  const idPaciente = localStorage.getItem("id_paciente");
  if (!idPaciente) {
    alert("No se encontró el ID del paciente.");
    return;
  }

  const supabase = window.supabase.createClient(
    "https://yqsasvrqzlqrgtywddmo.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc2FzdnJxemxxcmd0eXdkZG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDc3NDksImV4cCI6MjA2NDIyMzc0OX0.uQbaJnZExdU1_Ay_Sk-1KiiIcdNgUD3dSlsWGgiYc-M"
  );

  const { data, error } = await supabase
    .from("formulario_pacientes")
    .select("url_ojo_derecho, url_ojo_izquierdo, resultado_derecho, resultado_izquierdo")
    .eq("id", idPaciente)
    .single();

  if (error || !data) {
    alert("Error al recuperar datos del paciente para el PDF.");
    return;
  }

  const doc = new jsPDF();
  const logo = document.getElementById("logoMTI");

  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Informe de Resultados de Análisis de Fondo de Ojo", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  doc.text("Detección de Anomalías Oculares Asociadas a la Diabetes", 105, 28, { align: "center" });

  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(1);
  doc.line(10, 32, 200, 32);

  if (logo && logo.src) {
    doc.addImage(logo.src, "JPEG", 180, 10, 30, 20);
  }

  let y = 40;

  async function urlToBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  const base64Derecho = await urlToBase64(data.url_ojo_derecho);
  const base64Izquierdo = await urlToBase64(data.url_ojo_izquierdo);

  async function insertarOjo(titulo, base64, resultado) {
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(titulo, 10, y);

    if (base64) {
      doc.addImage(base64, "PNG", 10, y + 5, 50, 50);
    }

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text(`Clasificación del modelo: ${resultado}`, 70, y + 15);

    y += 60;
  }

  await insertarOjo("Resultado - Ojo derecho", base64Derecho, data.resultado_derecho);
  await insertarOjo("Resultado - Ojo izquierdo", base64Izquierdo, data.resultado_izquierdo);

  // ----------------------
  // TÍTULO DE CATEGORÍAS
  // ----------------------
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Clasificación de la Retinopatía Diabética:", 10, y);
  y += 8;

  // ----------------------
  // DEFINICIONES COMPLETAS
  // ----------------------

  const categorias = {
    "No_DR (Sin Retinopatía Diabética)":
      "No se observan hallazgos compatibles con retinopatía diabética. El fondo de ojo presenta una apariencia normal, sin microaneurismas ni signos de daño microvascular. Aunque no existan lesiones visibles, se recomienda seguimiento periódico en pacientes con diabetes.",

    "Mild (Retinopatía Leve)":
      "Se identifican únicamente microaneurismas, considerados la manifestación más temprana del daño microvascular retiniano. A pesar de que los cambios son mínimos, es necesario un monitoreo regular para evaluar progresión.",

    "Moderate (Retinopatía Diabética Moderada)":
      "Se observan más alteraciones vasculares que en la etapa leve, pero sin cumplir los criterios de retinopatía severa. Incluye múltiples microaneurismas, hemorragias intrarretinianas, exudados o dilataciones venosas. Esta etapa requiere evaluación especializada para determinar el riesgo de avance.",

    "Severe (Retinopatía Diabética Severa)":
      "Corresponde a una etapa avanzada de daño microvascular, sin evidencia de proliferación, y cumple uno o más de los criterios: más de veinte hemorragias intrarretinianas en los cuatro cuadrantes, beading venoso prominente en dos o más cuadrantes, o anomalías microvasculares intrarretinianas (IRMAs) moderadas en uno o más cuadrantes. Debido al alto riesgo de progresión a retinopatía proliferativa, se recomienda intervención médica oportuna.",

    "Proliferative (Retinopatía Diabética Proliferativa)":
      "Etapa avanzada caracterizada por la neovascularización patológica (crecimiento anómalo de nuevos vasos sanguíneos), hemorragias vítreas o desgarros retinianos. Representa una amenaza seria para la visión y requiere tratamiento especializado inmediato."
  };

  // Texto de definiciones tamaño 10
  doc.setFontSize(10);

  Object.entries(categorias).forEach(([nivel, descripcion]) => {
    doc.setFont(undefined, "bold");
    doc.text(`• ${nivel}:`, 10, y);

    doc.setFont(undefined, "normal");
    const lines = doc.splitTextToSize(descripcion, 175);
    doc.text(lines, 12, y + 4);

    y += lines.length * 4 + 10;
  });

  // ----------------------
  // BLOQUE ROJO (SUBIDO UNOS PIXELES)
  // ----------------------
  y -= 4;

  doc.setFontSize(8.5);
  doc.setTextColor(200, 0, 0);
  doc.setFont(undefined, "italic");

  doc.text(
    "Este reporte es de carácter informativo. No sustituye la evaluación de un profesional de la salud.",
    10,
    y
  );

  doc.text(
    "Se recomienda consultar con un médico especialista para diagnóstico y tratamiento adecuado.",
    10,
    y + 5
  );

  // ----------------------
  // REFERENCIA FINAL (EN LA POSICIÓN ANTIGUA DE “SE RECOMIENDA”)
  // ----------------------

  doc.text(
    "Información extraída de: American Academy of Ophthalmology. (2024). Preferred Practice Pattern®: Diabetic Retinopathy.https://www.aao.org",
    7.5,
    y + 12
  );

  // Descargar
  doc.save("Informe_Analisis_Fondo_Ojo.pdf");
});
