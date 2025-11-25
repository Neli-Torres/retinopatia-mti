let validoDerecho = false;
let validoIzquierdo = false;

const SUPABASE_URL = "https://yqsasvrqzlqrgtywddmo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc2FzdnJxemxxcmd0eXdkZG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDc3NDksImV4cCI6MjA2NDIyMzc0OX0.uQbaJnZExdU1_Ay_Sk-1KiiIcdNgUD3dSlsWGgiYc-M";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// === MOSTRAR PREVIEW ===
function mostrarPreview(inputFile, idPreview) {
  const archivo = inputFile.files[0];
  if (!archivo) return;

  const lector = new FileReader();
  lector.onload = e => {
    document.getElementById(idPreview).src = e.target.result;
  };
  lector.readAsDataURL(archivo);
}

// === VALIDAR IMAGEN CONTRA BACKEND ===
async function validarImagen(inputId, previewId, resultadoId) {
  const input = document.getElementById(inputId);
  const file = input.files[0];
  if (!file) return;

  mostrarPreview(input, previewId);

  const formData = new FormData();
  formData.append("imagen", file);

  try {
    // 🔥🔥🔥 URL ACTUALIZADA PARA PRODUCCIÓN EN RENDER
    const respuesta = await fetch("https://mti-validacion.onrender.com/evaluar-imagen", {
      method: "POST",
      body: formData
    });

    const data = await respuesta.json();
    const resultado = document.getElementById(resultadoId);

    if (data.valida) {
      resultado.textContent = "✅ Imagen válida";
      resultado.style.color = "green";
      resultado.style.backgroundColor = "#e6ffed";

      // === GUARDAR BASE64 EN SUPABASE ===
      const lectorBase64 = new FileReader();
      lectorBase64.onload = async e => {
        const base64 = e.target.result;

        const idPaciente = localStorage.getItem("id_paciente");
        if (!idPaciente) {
          alert("❌ No se encontró el ID del paciente en localStorage.");
          return;
        }

        const campo = inputId === "inputDerecho" ? "url_ojo_derecho" : "url_ojo_izquierdo";

        const { error: updateError } = await supabase
          .from("formulario_pacientes")
          .update({ [campo]: base64 })
          .eq("id", idPaciente);

        if (updateError) {
          console.error("❌ Error al guardar imagen base64:", updateError);
        } else {
          console.log(`✅ Imagen base64 guardada en ${campo}`);

          if (inputId === "inputDerecho") validoDerecho = true;
          if (inputId === "inputIzquierdo") validoIzquierdo = true;

          actualizarBotonAnalizar();
        }
      };

      lectorBase64.readAsDataURL(file);
    } else {
      resultado.textContent = "❌ Imagen no válida";
      resultado.style.color = "red";
      resultado.style.backgroundColor = "#ffe6e6";
      input.value = "";
      document.getElementById(previewId).src = "FONDO_OJO.png";

      if (inputId === "inputDerecho") validoDerecho = false;
      if (inputId === "inputIzquierdo") validoIzquierdo = false;

      actualizarBotonAnalizar();
    }

    resultado.style.display = "block";

  } catch (error) {
    console.error("❌ Error al conectar con la API:", error);
  }
}

// === HABILITAR/DESHABILITAR BOTÓN ===
function actualizarBotonAnalizar() {
  const boton = document.getElementById("btnAnalizar");
  if (validoDerecho && validoIzquierdo) {
    boton.disabled = false;
    boton.classList.remove("opacity-50", "cursor-not-allowed");
  } else {
    boton.disabled = true;
    boton.classList.add("opacity-50", "cursor-not-allowed");
  }
}

// === EVENTOS PARA LOS INPUTS ===
document.getElementById("inputDerecho").addEventListener("change", () => {
  validarImagen("inputDerecho", "previewDerecho", "resultadoDerecho");
});

document.getElementById("inputIzquierdo").addEventListener("change", () => {
  validarImagen("inputIzquierdo", "previewIzquierdo", "resultadoIzquierdo");
});

