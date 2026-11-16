// Unknown is intentional. Add audit dates, photographs and findings only after a site visit.
window.WAHFU_REST_POINTS = ['R1','R2','R3'].map(id=>({
  id,verification:'unverified',auditedAt:null,seating:null,covered:null,stepFreeAccess:null,photo:null,
  source:'OpenStreetMap location reference, 2026-11-11'
}));
