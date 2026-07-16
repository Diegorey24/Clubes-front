// Nombre completo de un socio para mostrar en listas/selectores.
// La API de Grupos Familiares ya devuelve SocNom (nombre completo
// concatenado); pero por las dudas, si en algún punto llega vacío o el
// dato viene de otro endpoint que solo trae los campos sueltos (Primer
// Nombre/Apellido, etc.), se arma a mano como fallback.
export const nombreCompleto = (s) => {
    if (!s) return '';
    const socNom = (s.SocNom || '').toString().trim();
    if (socNom) return socNom;
    const partes = [s.PrimerNombre, s.SegundoNombre, s.PrimerApellido, s.SegundoApellido]
        .map((p) => (p || '').toString().trim())
        .filter(Boolean);
    return partes.join(' ');
};
