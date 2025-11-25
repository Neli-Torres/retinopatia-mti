const supabase = window.supabase.createClient(
  "https://yqsasvrqzlqrgtywddmo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc2FzdnJxemxxcmd0eXdkZG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDc3NDksImV4cCI6MjA2NDIyMzc0OX0.uQbaJnZExdU1_Ay_Sk-1KiiIcdNgUD3dSlsWGgiYc-M"
);

document.getElementById("userForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  // Numéricos
  ["edad", "altura", "peso", "anios_con_diabetes"].forEach((key) => {
    if (!data[key]) {
      data[key] = null;
    } else {
      data[key] = Number(data[key]);
    }
  });

  // Afiliación
  if (!data.afiliacion || data.afiliacion === "") {
    data.afiliacion = null;
  }

  // Si NO tiene diabetes, limpiar campos asociados
  if (data.diabetes !== "Sí") {
    data.tipo_diabetes = null;
    data.anios_con_diabetes = null;
  }

  // Si NO tiene familiar con diabetes, limpiar detalle
  if (data.familiar_diabetes !== "Sí") {
    data.linea_familiar = null;
    data.tipo_diabetes_familiar = null;
  }

  const { data: insertado, error } = await supabase
    .from("formulario_pacientes")
    .insert([data])
    .select("id");

  if (error) {
    alert("Error al guardar: " + error.message);
    console.error(error);
    return;
  }

  const id = insertado[0].id;
  localStorage.setItem("id_paciente", id);
  alert("Datos guardados correctamente.");
  window.location.href = "pantalla_3.html";
});
