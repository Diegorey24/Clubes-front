// Arma un mensaje legible a partir de un error 409 de /gruposfamiliares
// (crear o sincronizar integrantes). El backend valida que ningún SocNro
// enviado tenga ya GruFamNro <> 0 y, si encuentra alguno, devuelve 409 con
// la lista de socios en conflicto -- acá se arma el texto para mostrar,
// soportando distintos nombres posibles de esa lista según cómo la mande
// el backend (socios/conflictos/integrantes).
export const describeGrupoFamiliarConflict = (err) => {
    const data = err?.response?.data;
    if (!data) return 'Algunos socios ya pertenecen a otro grupo familiar.';

    const lista = data.socios || data.conflictos || data.integrantes || [];
    const nombres = lista
        .map((s) => {
            const socNom = (s.SocNom || '').toString().trim();
            if (socNom) return socNom;
            const partes = [s.PrimerNombre, s.PrimerApellido].map((p) => (p || '').toString().trim()).filter(Boolean);
            if (partes.length) return partes.join(' ');
            return s.SocNro ? `Socio N.° ${s.SocNro}` : null;
        })
        .filter(Boolean);

    const base = data.error || data.message || 'Algunos socios ya pertenecen a otro grupo familiar.';
    return nombres.length > 0 ? `${base}: ${nombres.join(', ')}` : base;
};
