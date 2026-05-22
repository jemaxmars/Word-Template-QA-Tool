import { useState, useRef, useCallback, useEffect } from "react";

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#0b0e18", surface: "#13172a", surfaceAlt: "#1a1f35", border: "#252b45",
  accent: "#5b8df6", accentGlow: "#5b8df615", green: "#34d399", greenDim: "#34d39920",
  red: "#f87171", redDim: "#f8717118", yellow: "#fbbf24", yellowDim: "#fbbf2418",
  purple: "#a78bfa", purpleDim: "#a78bfa15", text: "#e2e8f0", muted: "#64748b", dim: "#94a3b8",
};

// ─── ALL ENTITIES from your Dataverse org (corrected from actual org) ───────────
const ALL_ENTITIES = [
  "pc_ace","pc_bai","pc_bdi","pc_bsi","pc_calocus","pc_ciwab","pc_ciwar",
  "pc_clientprogressnotes","pc_cows","pc_dass21","pc_diagnosis","pc_dischargesummary",
  "pc_eat26","pc_ehits","pc_fad","pc_fear","pc_gad7","pc_goalsmastertreatmentplan",
  "pc_hismdu","pc_ihrswellnessplancode","pc_ihrswellnessplandetails","pc_impairedcontrol",
  "pc_locus","pc_mdi","pc_mdq","pc_medication","pc_mentalhealthtreatment","pc_mms",
  "pc_npas","pc_paduainventory","pc_pcl5","pc_phonescreening","pc_pocutsurinescreen",
  "pc_precisionlaborder","pc_preliminarydiagnosis","pc_prescribedmedication","pc_primepc",
  "pc_progressnotesgroup","pc_qols","pc_referral","pc_riskassessment","pc_riskofrelapse",
  "pc_serviceauthorization","pc_substanceusehistory","pc_supervisorssignatures",
  "pc_transsummaries","pc_treatmentcontract","pc_treatmentplancategory",
  "pc_treatmentplanreview","pc_treatmentplanreviewdetails",
  "pc_treatmentrecommendationsfromassessment","pc_tsc40","pc_urica",
  "pc_utilizationsummary","pc_wiwfc","pc_wrap","pc_ybocs",
  // Additional entities found in templates
  "pc_gradeforareasofparenting","pc_schoolgradeexperiences",
  "pc_familymemberpresentforintake","cr9c9_verificationofbenefits",
  "pc_cptcodesforverificationofbenefits","pc_dimensionslevelofcarecalocuslocus"
];

// ─── Template filename → entity auto-mapping (corrected entity names) ──────────
const TEMPLATE_ENTITY_MAP = [
  { keywords: ["phone screen","phonescreening","active intake - bio","intake bio","active intake - family","family intake assessment"], entity: "pc_phonescreening" },
  { keywords: ["active intake - vob","vob","verification of benefits"], entity: "cr9c9_verificationofbenefits" },
  { keywords: ["progress note","progressnote","progress notes","clinical progress","psychiatric follow","recovery coach session"], entity: "pc_clientprogressnotes" },
  { keywords: ["group progress","group note","progressnotesgroup"],   entity: "pc_progressnotesgroup" },
  { keywords: ["mental health treatment","mht","mentalhealthtreatment"], entity: "pc_mentalhealthtreatment" },
  { keywords: ["treatment plan review","treatmentplanreview"],        entity: "pc_treatmentplanreview" },
  { keywords: ["goals - master","goals master","goalsmastertreatment"], entity: "pc_goalsmastertreatmentplan" },
  { keywords: ["discharge summary","dischargesummary"],               entity: "pc_dischargesummary" },
  { keywords: ["risk assessment","riskassessment"],                   entity: "pc_riskassessment" },
  { keywords: ["referral"],                                           entity: "pc_referral" },
  { keywords: ["treatment contract","treatmentcontract"],             entity: "pc_treatmentcontract" },
  { keywords: ["substance use history","substanceusehistory"],        entity: "pc_substanceusehistory" },
  { keywords: ["utilization summary","utilizationsummary"],           entity: "pc_utilizationsummary" },
  { keywords: ["ihrs planned discharge","ihrs wellness coordinator"], entity: "pc_ihrswellnessplandetails" },
  { keywords: ["ihrs wellness plan code","ihrswellnessplancode"],    entity: "pc_ihrswellnessplancode" },
  { keywords: ["diagnostic placement","preliminary diagnosis"],       entity: "pc_preliminarydiagnosis" },
  { keywords: ["diagnosis"],                                          entity: "pc_diagnosis" },
  { keywords: ["prescribed medication","prescribedmedication"],       entity: "pc_prescribedmedication" },
  { keywords: ["service authorization","serviceauthorization"],       entity: "pc_serviceauthorization" },
  { keywords: ["transition summary","transsummaries"],                entity: "pc_transsummaries" },
  { keywords: ["treatment recommendation","treatmentrecommendation"], entity: "pc_treatmentrecommendationsfromassessment" },
  { keywords: ["ace"],                                                entity: "pc_ace" },
  { keywords: ["bai","beck anxiety"],                                 entity: "pc_bai" },
  { keywords: ["bdi","beck depression"],                              entity: "pc_bdi" },
  { keywords: ["bsi","brief symptom"],                                entity: "pc_bsi" },
  { keywords: ["calocus"],                                            entity: "pc_calocus" },
  { keywords: ["ciwa-b","ciwab"],                                     entity: "pc_ciwab" },
  { keywords: ["ciwa-r","ciwar"],                                     entity: "pc_ciwar" },
  { keywords: ["cows"],                                               entity: "pc_cows" },
  { keywords: ["dass-21","dass21"],                                   entity: "pc_dass21" },
  { keywords: ["eat-26","eat26"],                                     entity: "pc_eat26" },
  { keywords: ["e-hits","ehits"],                                     entity: "pc_ehits" },
  { keywords: ["fad ","family assessment"],                           entity: "pc_fad" },
  { keywords: ["fear "],                                              entity: "pc_fear" },
  { keywords: ["gad-7","gad7"],                                       entity: "pc_gad7" },
  { keywords: ["hismdu"],                                             entity: "pc_hismdu" },
  { keywords: ["impaired control","impairedcontrol"],                 entity: "pc_impairedcontrol" },
  { keywords: ["locus"],                                              entity: "pc_locus" },
  { keywords: ["mdi "],                                               entity: "pc_mdi" },
  { keywords: ["mdq","mood disorder"],                                entity: "pc_mdq" },
  { keywords: ["medication log","medication list"],                   entity: "pc_medication" },
  { keywords: ["mms "],                                               entity: "pc_mms" },
  { keywords: ["npas"],                                               entity: "pc_npas" },
  { keywords: ["padua"],                                              entity: "pc_paduainventory" },
  { keywords: ["pcl-5","pcl5","ptsd checklist"],                      entity: "pc_pcl5" },
  { keywords: ["pocut","urine screen"],                               entity: "pc_pocutsurinescreen" },
  { keywords: ["precision lab","precisionlab"],                       entity: "pc_precisionlaborder" },
  { keywords: ["prime-pc","primepc"],                                 entity: "pc_primepc" },
  { keywords: ["qols","quality of life"],                             entity: "pc_qols" },
  { keywords: ["risk of relapse","riskofrelapse"],                    entity: "pc_riskofrelapse" },
  { keywords: ["supervisor","supervisors signature"],                 entity: "pc_supervisorssignatures" },
  { keywords: ["tsc-40","tsc40"],                                     entity: "pc_tsc40" },
  { keywords: ["urica"],                                              entity: "pc_urica" },
  { keywords: ["wiwfc"],                                              entity: "pc_wiwfc" },
  { keywords: ["wrap "],                                              entity: "pc_wrap" },
  { keywords: ["y-bocs","ybocs"],                                     entity: "pc_ybocs" },
];

function autoMapEntity(filename) {
  const lower = filename.toLowerCase().replace(/[-_]/g, " ");
  for (const { keywords, entity } of TEMPLATE_ENTITY_MAP) {
    if (keywords.some(k => lower.includes(k))) return entity;
  }
  return null;
}

// ─── JSZip loader (loaded once, lazily) ─────────────────────────────────────
let _jszip = null;
async function getJSZip() {
  if (_jszip) return _jszip;
  await new Promise((resolve, reject) => {
    if (window.JSZip) { _jszip = window.JSZip; resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    s.onload = () => { _jszip = window.JSZip; resolve(); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return _jszip;
}

// ─── DOCX field parser (proper ZIP extraction) ───────────────────────────────
async function parseDocxFields(arrayBuffer) {
  const JSZip = await getJSZip();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // Read ALL xml files in the zip (word/, customXml/, etc.)
  const allXmlFiles = Object.keys(zip.files).filter(name => name.endsWith(".xml"));
  const xmlParts = [];
  for (const name of allXmlFiles) {
    try {
      const c = await zip.files[name].async("string");
      xmlParts.push(c);
    } catch (e) { /* skip unreadable */ }
  }
  const text = xmlParts.join("\n");

  // Extract entity names from XML namespace declarations
  const entityNames = new Set();
  [...text.matchAll(/xmlns:ns\d+='([^']*)'/g)].forEach(m => {
    const parts = m[1].split("/");
    if (parts.length >= 4) entityNames.add(parts[3]);
  });

  // Parse xpath structure:
  // Level 2: /ns0:DocumentTemplate[1]/pc_phonescreening[1]/pc_dateofcall[1]
  //          -> entity=pc_phonescreening, field=pc_dateofcall
  // Level 3: /ns0:DocumentTemplate[1]/pc_phonescreening[1]/pc_phonescreening_Client_contact[1]/firstname[1]
  //          -> relationship=pc_phonescreening_Client_contact -> entity=contact, field=firstname
  // Level 3: /ns0:DocumentTemplate[1]/pc_phonescreening[1]/pc_prescribedmedication_ActiveIntake_pc_phonescreening[1]/pc_dose[1]
  //          -> relationship=pc_prescribedmedication_... -> entity=pc_prescribedmedication, field=pc_dose

  function cleanSeg(s) {
    return s.replace(/^[a-zA-Z0-9_]+:/, "").replace(/\[\d+\]$/, "");
  }

  // Infer the related entity from a relationship segment name
  // e.g. "pc_phonescreening_Client_contact" -> "contact"
  //      "pc_prescribedmedication_ActiveIntake_pc_phonescreening" -> "pc_prescribedmedication"
  function inferEntityFromRelationship(rel, primaryEntity) {
    // Check if relationship ends with a known standard entity
    const STANDARD = ["contact","account","systemuser","team","lead"];
    for (const e of STANDARD) {
      if (rel.endsWith("_" + e) || rel === e) return e;
    }
    // Check if relationship starts with a known pc_ entity (related table)
    // e.g. pc_prescribedmedication_ActiveIntake_pc_phonescreening -> pc_prescribedmedication
    // Match any publisher-prefixed entity: pc_xxx, cr9c9_xxx, etc.
    const anyMatch = rel.match(/^([a-z][a-z0-9]*_[a-z][a-z0-9]*)_/);
    if (anyMatch && anyMatch[1] !== primaryEntity) return anyMatch[1];
    // Fallback to primary entity
    return primaryEntity;
  }

  const seen = new Set();
  const fields = [];
  let idx = 0;

  // Strategy 1: w:xpath bindings — handles DocumentTemplate 3-level hierarchy
  // /ns0:DocumentTemplate[1]/ENTITY[1]/FIELD[1]
  // /ns0:DocumentTemplate[1]/ENTITY[1]/RELATIONSHIP[1]/FIELD[1]
  for (const match of text.matchAll(/<[^>]{0,400}w:xpath="([^"]+)"[^>]{0,200}>/g)) {
    const xpath = match[1];
    if (seen.has(xpath)) continue;
    seen.add(xpath);

    const segs = xpath.split("/").filter(Boolean).map(cleanSeg);

    let primaryEntity, fieldName, entityName, relationship;

    if (segs[0] === "DocumentTemplate" || segs.length >= 3) {
      // If segs[1] is a number (entity type code like 10532), it's not the entity name
      // Try segs[2] or fall back to parsing the xpath differently
      primaryEntity = (/^\d+$/.test(segs[1]) ? segs[2] : segs[1]) || "";
      if (segs.length === 3) {
        // Direct field: DocumentTemplate / entity / field
        // BUT skip if last segment looks like a relationship container (has pattern: entity_Something_entity)
        const lastSeg = segs[2];
        const isRelationshipContainer = /^pc_[a-z]+_[A-Z]/.test(lastSeg) || (lastSeg.match(/_/g) || []).length >= 3;
        if (isRelationshipContainer) continue; // skip relationship container nodes
        entityName = primaryEntity;
        fieldName = lastSeg;
        relationship = null;
      } else if (segs.length >= 4) {
        // Related table: DocumentTemplate / entity / relationship / field
        relationship = segs[2];
        fieldName = segs[segs.length - 1];
        entityName = inferEntityFromRelationship(relationship, primaryEntity);
      } else {
        entityName = primaryEntity;
        fieldName = segs[segs.length - 1];
      }
    } else {
      // 2-level: entity / field
      entityName = segs[0] || "";
      fieldName = segs[segs.length - 1];
    }

    if (fieldName) fields.push({ idx: idx++, fieldName, entityName, relationship: relationship || "", xpath, source: "xpath" });
  }

  // Strategy 2: customXml item files — read XML data islands directly
  // These contain the actual field elements like <pc_fieldname>value</pc_fieldname>
  if (fields.length === 0) {
    const customXmlFiles = Object.keys(zip.files).filter(
      name => name.startsWith("customXml/item") && name.endsWith(".xml")
    );
    for (const name of customXmlFiles) {
      try {
        const xmlStr = await zip.files[name].async("string");
        // Match element names that look like Dataverse fields (contain underscore, start with pc_ or known prefixes)
        const tagMatches = [...xmlStr.matchAll(/<([a-zA-Z][a-zA-Z0-9_]*:[a-zA-Z][a-zA-Z0-9_]*)[\s/>]/g)];
        for (const m of tagMatches) {
          const raw = m[1];
          const localName = raw.includes(":") ? raw.split(":")[1] : raw;
          const key = localName;
          if (seen.has(key)) continue;
          // Skip generic XML tags
          if (["schema","sequence","element","complexType","annotation"].includes(localName)) continue;
          seen.add(key);
          // Try to get entity from namespace
          const nsPrefix = raw.split(":")[0];
          const nsMatch = xmlStr.match(new RegExp(`xmlns:${nsPrefix}='([^']*)'`));
          const entityName = nsMatch ? (nsMatch[1].split("/")[3] || "") : "";
          fields.push({ idx: idx++, fieldName: localName, entityName, xpath: raw, source: "customXml" });
        }
      } catch(e) { /* skip */ }
    }
  }

  // Strategy 3: w:tag on SDTs — some templates use tag names as field references
  if (fields.length === 0) {
    for (const match of text.matchAll(/w:tag\s+w:val="([^"]+)"/g)) {
      const tag = match[1];
      if (!tag || seen.has(tag)) continue;
      seen.add(tag);
      fields.push({ idx: idx++, fieldName: tag, entityName: "", xpath: tag, source: "sdt-tag" });
    }
  }

  return { fields, entityNames: [...entityNames], zipFiles: allXmlFiles };
}
// ─── Validate template fields against schema ──────────────────────────────────
// schemas = { entity_name: [field, ...], ... }  (the full schemas map)
// primaryEntity = the template's assigned entity
function validateFields(fields, schemas, primaryEntity) {
  const STANDARD_ENTITIES = ["contact", "account", "systemuser", "team", "lead",
    "opportunity", "incident", "task", "phonecall", "appointment"];
  // Non-Dataverse entity names that Word uses internally - treat as belonging to primaryEntity
  const WORD_INTERNAL = ["DocumentTemplate", "DocumentElement", "Document", "Body", ""];

  return fields.map(f => {
    let rawEntity = f.entityName || "";
    const entityLooksInvalid = /^\d+$/.test(rawEntity) || rawEntity.length > 100;
    
    // If entity is a Word internal name or invalid, fall back to primary entity
    const fieldEntity = (entityLooksInvalid || WORD_INTERNAL.includes(rawEntity))
      ? (primaryEntity || "")
      : (rawEntity || primaryEntity || "");

    if (STANDARD_ENTITIES.includes(fieldEntity)) {
      return { ...f, entityName: fieldEntity, status: "system", issues: [], note: `Standard CRM field (${fieldEntity})` };
    }

    const schema = schemas[fieldEntity] || schemas[primaryEntity] || null;
    if (!schema) {
      return { ...f, entityName: fieldEntity || "unknown", status: "unknown", issues: [] };
    }

    const issues = [];
    if (!schema.includes(f.fieldName)) issues.push(`Not found in ${fieldEntity} schema`);
    return { ...f, entityName: fieldEntity, status: issues.length === 0 ? "pass" : "fail", issues };
  });
}
// ─── Persistence helpers ──────────────────────────────────────────────────────
const LS_SCHEMAS = "qa_schemas_v2";
const LS_TEMPLATES = "qa_templates_v2";

function loadFromStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function saveToStorage(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
const pill = (label, color, count) => (
  <span key={label} style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
    background: color + "22", color, border: `1px solid ${color}40`,
  }}>
    {count !== undefined && <span style={{ fontWeight: 900 }}>{count}</span>}
    {label}
  </span>
);

function Btn({ onClick, children, color = C.accent, small, style = {} }) {
  return (
    <button onClick={onClick} style={{
      padding: small ? "4px 10px" : "6px 14px",
      borderRadius: 6, cursor: "pointer", fontSize: small ? 11 : 12, fontWeight: 700,
      border: `1px solid ${color}50`, background: color + "18", color,
      transition: "all 0.15s", ...style,
    }}>{children}</button>
  );
}

// ─── Entity Schema Panel ──────────────────────────────────────────────────────
const BASE_URL = "https://dev-projectcourage.crm.dynamics.com/api/data/v9.2";

async function fetchEntityFields(entity) {
  const url = `${BASE_URL}/EntityDefinitions(LogicalName='${entity}')/Attributes?$select=LogicalName`;
  const res = await fetch(url, { credentials: "include", headers: { "OData-MaxVersion": "4.0", "OData-Version": "4.0", "Accept": "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.value.map(f => f.LogicalName).filter(Boolean);
}

function SchemaPanel({ schemas, setSchemas }) {
  const [pasteTarget, setPasteTarget] = useState(null);
  const [pasteVal, setPasteVal] = useState("");
  const [error, setError] = useState("");
  const [pasteAllMode, setPasteAllMode] = useState(false);
  const [pasteAllVal, setPasteAllVal] = useState("");
  const [pasteAllError, setPasteAllError] = useState("");

  function handlePasteAll() {
    try {
      const parsed = JSON.parse(pasteAllVal.trim());
      if (typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Expected a JSON object");
      const next = { ...schemas };
      let count = 0;
      for (const [entity, fields] of Object.entries(parsed)) {
        if (Array.isArray(fields)) { next[entity] = fields; count++; }
      }
      if (count === 0) throw new Error("No valid entity schemas found in JSON");
      setSchemas(next);
      saveToStorage(LS_SCHEMAS, next);
      setPasteAllMode(false);
      setPasteAllVal("");
      setPasteAllError("");
    } catch(e) {
      setPasteAllError("Parse error: " + e.message);
    }
  }

  async function fetchOneSchema(entity) {
    try {
      const fields = await fetchEntityFields(entity);
      const next = { ...schemas, [entity]: fields };
      setSchemas(next);
      saveToStorage(LS_SCHEMAS, next);
    } catch(e) {
      setError(`Failed to fetch ${entity}: ${e.message}`);
    }
  }

  function handlePaste(entity) {
    const raw = pasteVal.trim();
    let fields = [];
    // Try JSON array of logical names
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        fields = parsed.map(f => (typeof f === "string" ? f : f.LogicalName)).filter(Boolean);
      } else if (parsed.value) {
        fields = parsed.value.map(f => f.LogicalName).filter(Boolean);
      }
    } catch {
      // Try newline/comma separated plain text
      fields = raw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    }
    if (fields.length === 0) { setError("Could not parse — paste JSON or newline-separated names"); return; }
    const next = { ...schemas, [entity]: fields };
    setSchemas(next);
    saveToStorage(LS_SCHEMAS, next);
    setPasteTarget(null);
    setPasteVal("");
    setError("");
  }

  function removeSchema(entity) {
    const next = { ...schemas };
    delete next[entity];
    setSchemas(next);
    saveToStorage(LS_SCHEMAS, next);
  }

  const loaded = ALL_ENTITIES.filter(e => schemas[e]);
  const missing = ALL_ENTITIES.filter(e => !schemas[e]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>Entity Schemas</div>
        {pill(`${loaded.length} loaded`, C.green)}
        {pill(`${missing.length} pending`, C.yellow)}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {loaded.length > 0 && (
            <Btn onClick={() => { setSchemas({}); saveToStorage(LS_SCHEMAS, {}); }} color={C.red} small>Clear all</Btn>
          )}
          <Btn onClick={() => { setPasteAllMode(m => !m); setPasteAllError(""); }} color={C.purple}
            style={{ fontWeight: 800, fontSize: 13, padding: "7px 18px" }}>
            📋 Paste All Schemas (from bookmarklet)
          </Btn>
        </div>
      </div>


      {/* Paste-all panel */}
      {pasteAllMode && (
        <div style={{ background: C.purpleDim, border: `1px solid ${C.purple}50`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: C.purple, marginBottom: 8 }}>📋 Paste All Schemas</div>
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 10, lineHeight: 1.7 }}>
            Run the bookmarklet on your Dynamics site, wait for it to finish, then paste the copied JSON here.
          </div>
          <textarea
            autoFocus
            value={pasteAllVal}
            onChange={e => setPasteAllVal(e.target.value)}
            style={{ width: "100%", height: 120, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 12, padding: 8, resize: "vertical", fontFamily: "monospace", boxSizing: "border-box" }}
            placeholder={'{"pc_phonescreening":["pc_dateofcall","firstname",...], "pc_clientprogressnotes":[...], ...}'}
          />
          {pasteAllError && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{pasteAllError}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Btn onClick={handlePasteAll} color={C.green}>✓ Import All Schemas</Btn>
            <Btn onClick={() => { setPasteAllMode(false); setPasteAllVal(""); setPasteAllError(""); }} color={C.muted} small>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Bookmarklet instructions */}
      {!pasteAllMode && loaded.length < ALL_ENTITIES.length && (
        <div style={{ background: C.accentGlow, border: `1px solid ${C.accent}40`, borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: C.dim, lineHeight: 1.8 }}>
          <strong style={{ color: C.accent }}>How to load all schemas at once:</strong><br />
          <span style={{ color: C.text }}>1.</span> Download the <strong style={{ color: C.text }}>bookmarklet file</strong> (ask Claude for it — it was generated alongside this app).<br />
          <span style={{ color: C.text }}>2.</span> In Chrome, go to <strong>Bookmarks → Bookmark Manager</strong>, create a new bookmark, paste the entire bookmarklet code as the URL.<br />
          <span style={{ color: C.text }}>3.</span> Navigate to <code style={{ color: C.accent }}>dev-projectcourage.crm.dynamics.com</code> (any page, just needs to be logged in).<br />
          <span style={{ color: C.text }}>4.</span> Click the bookmarklet — a progress overlay will appear and fetch all 44 schemas automatically.<br />
          <span style={{ color: C.text }}>5.</span> When it says "copied to clipboard", come back here and click <strong style={{ color: C.purple }}>📋 Paste All Schemas</strong>.
        </div>
      )}

      {/* Manual fallback instructions (collapsed) */}
      {loaded.length < ALL_ENTITIES.length && (
        <details style={{ marginBottom: 16 }}>
          <summary style={{ cursor: "pointer", fontSize: 12, color: C.muted, padding: "6px 0" }}>
            ▸ Manual fallback: load a single schema by pasting
          </summary>
          <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginTop: 8, fontSize: 12, color: C.dim, lineHeight: 1.8 }}>
            Click <strong style={{ color: C.text }}>Paste Schema</strong> on any entity, open its API URL, run
            <code style={{ color: C.green, display: "block", margin: "4px 0 4px 12px" }}>
              JSON.parse(document.body.innerText).value.map(f=&gt;f.LogicalName).join('
')
            </code>
            in the console, and paste the output.
          </div>
        </details>
      )}

      {/* Entity grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
        {ALL_ENTITIES.map(entity => {
          const isLoaded = !!schemas[entity];
          const isActive = pasteTarget === entity;
          const apiUrl = `https://dev-projectcourage.crm.dynamics.com/api/data/v9.2/EntityDefinitions(LogicalName='${entity}')/Attributes?$select=LogicalName`;
          const consoleSnippet = `JSON.parse(document.body.innerText).value.map(f=>f.LogicalName).join('\\n')`;
          return (
            <div key={entity} style={{
              background: isLoaded ? C.greenDim : C.surface,
              border: `1px solid ${isLoaded ? C.green + "50" : isActive ? C.accent : C.border}`,
              borderRadius: 8, padding: 12, transition: "all 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isActive ? 10 : 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, color: isLoaded ? C.green : C.muted }}>
                    {isLoaded ? "✓" : "○"}
                  </span>
                  <code style={{ fontSize: 12, color: isLoaded ? C.text : C.dim }}>{entity}</code>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {isLoaded && (
                    <Btn small onClick={() => removeSchema(entity)} color={C.red}>✕</Btn>
                  )}
                  <Btn small onClick={() => fetchOneSchema(entity)} color={C.green}>↻</Btn>
                  <Btn small onClick={() => { setPasteTarget(isActive ? null : entity); setPasteVal(""); setError(""); }}
                    color={isActive ? C.yellow : C.accent}>
                    {isActive ? "Cancel" : isLoaded ? "Paste" : "Paste Schema"}
                  </Btn>
                </div>
              </div>

              {/* Always-visible Open API link */}
              {!isActive && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <a
                    href={apiUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 11, color: C.accent, textDecoration: "none",
                      background: C.accentGlow, border: `1px solid ${C.accent}40`,
                      padding: "2px 8px", borderRadius: 4, fontWeight: 700,
                    }}
                  >↗ Open API</a>
                  {isLoaded && (
                    <span style={{ fontSize: 11, color: C.muted }}>{schemas[entity].length} fields loaded</span>
                  )}
                </div>
              )}

              {isActive && (
                <div>
                  {/* Clickable URL */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>Step 1 — open this URL (already has the correct entity name):</div>
                    <a
                      href={apiUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 11, color: C.accent, wordBreak: "break-all",
                        display: "block", background: C.bg, padding: "6px 10px",
                        borderRadius: 6, border: `1px solid ${C.accent}40`,
                        textDecoration: "none",
                      }}
                    >↗ {apiUrl}</a>
                  </div>
                  {/* Console snippet */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>Step 2 — run in the Console tab (F12):</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <code style={{
                        fontSize: 11, color: C.green, background: C.bg, padding: "6px 10px",
                        borderRadius: 6, border: `1px solid ${C.green}30`, flex: 1, wordBreak: "break-all",
                      }}>{consoleSnippet}</code>
                      <Btn small color={C.green} onClick={() => navigator.clipboard.writeText(consoleSnippet)}>Copy</Btn>
                    </div>
                  </div>
                  {/* Paste area */}
                  <div style={{ fontSize: 11, color: C.dim, marginBottom: 6 }}>Step 3 — paste the output here:</div>
                  <textarea
                    autoFocus
                    value={pasteVal}
                    onChange={e => setPasteVal(e.target.value)}
                    style={{
                      width: "100%", height: 90, background: C.bg, border: `1px solid ${C.border}`,
                      borderRadius: 6, color: C.text, fontSize: 12, padding: 8, resize: "vertical",
                      fontFamily: "monospace", boxSizing: "border-box",
                    }}
                    placeholder="Paste field names here (one per line, or JSON array)"
                  />
                  {error && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{error}</div>}
                  <Btn onClick={() => handlePaste(entity)} color={C.green} style={{ marginTop: 8 }}>
                    ✓ Save Schema
                  </Btn>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ─── Summary Panel ────────────────────────────────────────────────────────────
function SummaryPanel({ templates, schemas, setSelected, setActiveTab }) {
  const [sortBy, setSortBy] = useState("fail");
  const [filter, setFilter] = useState("all");

  const sorted = [...templates]
    .filter(t => {
      if (filter === "fail") return t.fail > 0;
      if (filter === "pass") return t.fail === 0 && t.pass > 0;
      if (filter === "unknown") return t.unknown > 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "fail") return b.fail - a.fail;
      if (sortBy === "pass") return b.pass - a.pass;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "fields") return b.results.length - a.results.length;
      return 0;
    });

  const totalTemplates = templates.length;
  const cleanTemplates = templates.filter(t => t.fail === 0 && t.pass > 0).length;
  const failTemplates = templates.filter(t => t.fail > 0).length;
  const unknownTemplates = templates.filter(t => t.unknown > 0 && t.fail === 0).length;
  const totalFields = templates.reduce((s, t) => s + t.results.length, 0);
  const totalPass = templates.reduce((s, t) => s + t.pass, 0);
  const totalFail = templates.reduce((s, t) => s + t.fail, 0);

  if (templates.length === 0) return (
    <div style={{ padding: 40, textAlign: "center", color: C.muted }}>
      Drop .docx templates in the QA tab first
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      {/* Stats row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Templates", value: totalTemplates, color: C.text },
          { label: "✓ Clean", value: cleanTemplates, color: C.green },
          { label: "✗ Has failures", value: failTemplates, color: C.red },
          { label: "? Unvalidated", value: unknownTemplates, color: C.yellow },
          { label: "Total fields", value: totalFields, color: C.dim },
          { label: "Pass", value: totalPass, color: C.green },
          { label: "Fail", value: totalFail, color: C.red },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 18px", minWidth: 100, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: C.muted }}>Filter:</span>
        {[["all","All"],["fail","Failures only"],["pass","Clean only"],["unknown","Unvalidated"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600,
            border: `1px solid ${filter === val ? C.accent : C.border}`,
            background: filter === val ? C.accentGlow : "transparent",
            color: filter === val ? C.accent : C.dim,
          }}>{label}</button>
        ))}
        <span style={{ fontSize: 12, color: C.muted, marginLeft: 12 }}>Sort:</span>
        {[["fail","Most failures"],["pass","Most passing"],["fields","Field count"],["name","Name"]].map(([val, label]) => (
          <button key={val} onClick={() => setSortBy(val)} style={{
            padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600,
            border: `1px solid ${sortBy === val ? C.purple : C.border}`,
            background: sortBy === val ? C.purpleDim : "transparent",
            color: sortBy === val ? C.purple : C.dim,
          }}>{label}</button>
        ))}
        <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>{sorted.length} templates</span>
      </div>

      {/* Template table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: C.surfaceAlt }}>
            {["Template", "Entity", "Fields", "Pass", "Fail", "?", "Status", "Failing Fields"].map(h => (
              <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: C.muted, fontWeight: 700, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((t, i) => {
            const isClean = t.fail === 0 && t.pass > 0;
            const hasFail = t.fail > 0;
            const rowBg = hasFail ? C.redDim : isClean ? C.greenDim : "transparent";
            const failingFields = t.results.filter(r => r.status === "fail").slice(0, 5).map(r => r.fieldName);
            const hasSchema = !!schemas[t.entity];
            return (
              <tr key={t.id}
                onClick={() => { setSelected(t.id); setActiveTab("qa"); }}
                style={{ background: i % 2 === 0 ? rowBg : "transparent", borderBottom: `1px solid ${C.border}20`, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = C.accentGlow}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? rowBg : "transparent"}
              >
                <td style={{ padding: "8px 12px", color: C.text, maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name.replace(".docx","")}</td>
                <td style={{ padding: "8px 12px" }}>
                  <code style={{ fontSize: 11, color: hasSchema ? C.accent : C.yellow }}>{t.entity || "—"}</code>
                  {!hasSchema && t.entity && <span style={{ color: C.yellow, fontSize: 10, marginLeft: 4 }}>⚠</span>}
                </td>
                <td style={{ padding: "8px 12px", color: C.dim, textAlign: "right" }}>{t.results.length}</td>
                <td style={{ padding: "8px 12px", color: C.green, fontWeight: 700, textAlign: "right" }}>{t.pass > 0 ? t.pass : ""}</td>
                <td style={{ padding: "8px 12px", color: C.red, fontWeight: 700, textAlign: "right" }}>{t.fail > 0 ? t.fail : ""}</td>
                <td style={{ padding: "8px 12px", color: C.yellow, textAlign: "right" }}>{t.unknown > 0 ? t.unknown : ""}</td>
                <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                  {!hasSchema && t.entity ? (
                    <span style={{ color: C.yellow, fontSize: 11 }}>⚠ no schema</span>
                  ) : t.results.length === 0 ? (
                    <span style={{ color: C.muted, fontSize: 11 }}>0 fields parsed</span>
                  ) : isClean ? (
                    <span style={{ color: C.green, fontWeight: 700 }}>✓ Clean</span>
                  ) : hasFail ? (
                    <span style={{ color: C.red, fontWeight: 700 }}>✗ {t.fail} issue{t.fail !== 1 ? "s" : ""}</span>
                  ) : (
                    <span style={{ color: C.yellow }}>? unvalidated</span>
                  )}
                </td>
                <td style={{ padding: "8px 12px", color: C.red, fontSize: 11, maxWidth: 300 }}>
                  {failingFields.join(", ")}{t.results.filter(r => r.status === "fail").length > 5 ? ` +${t.results.filter(r => r.status === "fail").length - 5} more` : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("qa");
  const [schemas, setSchemas] = useState(() => loadFromStorage(LS_SCHEMAS) || {});
  const [templates, setTemplates] = useState(() => {
    // Templates stored without ArrayBuffer (can't serialize), just metadata + results
    return loadFromStorage(LS_TEMPLATES) || [];
  });
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef();

  // Re-validate all templates when schemas change
  useEffect(() => {
    if (templates.length === 0) return;
    setTemplates(prev => {
      const next = prev.map(t => ({
        ...t,
        results: validateFields(t.rawFields || [], schemas, t.entity),
      }));
      saveToStorage(LS_TEMPLATES, next.map(t => ({ ...t, rawFields: t.rawFields })));
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemas]);

  async function processFiles(files) {
    setProcessing(true);
    const newTemplates = [];
    for (const file of files) {
      if (!file.name.endsWith(".docx")) continue;
      const buf = await file.arrayBuffer();
      const { fields, entityNames, zipFiles } = await parseDocxFields(buf);
      const autoEntity = autoMapEntity(file.name);
      const entity = autoEntity || (entityNames[0] || "");
      const results = validateFields(fields, schemas, entity);
      const pass = results.filter(r => r.status === "pass" || r.status === "system").length;
      const fail = results.filter(r => r.status === "fail").length;
      const unknown = results.filter(r => r.status === "unknown").length;
      newTemplates.push({
        id: `${file.name}_${Date.now()}`,
        name: file.name,
        zipFiles: zipFiles || [],
        entity,
        autoMapped: !!autoEntity,
        rawFields: fields,
        results,
        pass, fail, unknown,
      });
    }
    setTemplates(prev => {
      // Deduplicate by name
      const names = new Set(newTemplates.map(t => t.name));
      const filtered = prev.filter(t => !names.has(t.name));
      const next = [...filtered, ...newTemplates];
      saveToStorage(LS_TEMPLATES, next.map(t => ({ ...t })));
      return next;
    });
    setProcessing(false);
  }

  function updateTemplateEntity(id, entity) {
    setTemplates(prev => {
      const next = prev.map(t => {
        if (t.id !== id) return t;
        const results = validateFields(t.rawFields || [], schemas, entity);
        const pass = results.filter(r => r.status === "pass" || r.status === "system").length;
        const fail = results.filter(r => r.status === "fail").length;
        const unknown = results.filter(r => r.status === "unknown").length;
        return { ...t, entity, autoMapped: false, results, pass, fail, unknown };
      });
      saveToStorage(LS_TEMPLATES, next);
      return next;
    });
  }

  function removeTemplate(id) {
    setTemplates(prev => {
      const next = prev.filter(t => t.id !== id);
      saveToStorage(LS_TEMPLATES, next);
      return next;
    });
    if (selected === id) setSelected(null);
  }

  function clearAll() {
    setTemplates([]);
    setSelected(null);
    localStorage.removeItem(LS_TEMPLATES);
  }

  function exportCSV() {
    const rows = [["File", "Entity", "Auto-mapped", "Field", "Status", "Issues"]];
    templates.forEach(t =>
      t.results.forEach(r =>
        rows.push([t.name, t.entity, t.autoMapped ? "Yes" : "No",
          r.fieldName, r.status, r.issues.join("; ")])
      )
    );
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `qa_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    processFiles([...e.dataTransfer.files]);
  }, [schemas]); // eslint-disable-line

  const totalPass = templates.reduce((s, t) => s + t.pass, 0);
  const totalFail = templates.reduce((s, t) => s + t.fail, 0);
  const totalUnknown = templates.reduce((s, t) => s + t.unknown, 0);
  const schemasLoaded = ALL_ENTITIES.filter(e => schemas[e]).length;
  const selTemplate = templates.find(t => t.id === selected);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#5b8df6,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>⚡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Dataverse Template QA</div>
            <div style={{ fontSize: 11, color: C.muted }}>All data persists across refreshes · {schemasLoaded}/{ALL_ENTITIES.length} schemas loaded</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[["qa","🔍 QA"], ["summary","📊 Summary"], ["schemas",`📋 Schemas${schemasLoaded > 0 ? ` (${schemasLoaded})` : ""}`]].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700,
              border: `1px solid ${activeTab === tab ? C.accent : C.border}`,
              background: activeTab === tab ? C.accentGlow : "transparent",
              color: activeTab === tab ? C.accent : C.dim,
            }}>
              {label}
            </button>
          ))}
          {templates.length > 0 && (
            <Btn onClick={exportCSV} color={C.green}>↓ Export CSV</Btn>
          )}
        </div>
      </div>

      {activeTab === "schemas" ? (
        <div style={{ flex: 1, overflow: "auto" }}>
          <SchemaPanel schemas={schemas} setSchemas={setSchemas} />
        </div>
      ) : activeTab === "summary" ? (
        <div style={{ flex: 1, overflow: "auto" }}>
          <SummaryPanel templates={templates} schemas={schemas} setSelected={setSelected} setActiveTab={setActiveTab} />
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Left: template list */}
          <div style={{ width: 340, flexShrink: 0, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Stats bar */}
            {templates.length > 0 && (
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {pill(`${totalPass} pass`, C.green)}
                {pill(`${totalFail} fail`, C.red)}
                {totalUnknown > 0 && pill(`${totalUnknown} ?`, C.yellow)}
                <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>{templates.length} files</span>
                <Btn small onClick={clearAll} color={C.red}>Clear all</Btn>
              </div>
            )}

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
              style={{
                margin: 12, borderRadius: 10, border: `2px dashed ${dragging ? C.accent : C.border}`,
                background: dragging ? C.accentGlow : "transparent",
                padding: "16px 12px", textAlign: "center", cursor: "pointer", transition: "all 0.2s",
              }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>📂</div>
              <div style={{ fontSize: 12, color: C.dim }}>
                {processing ? "Processing…" : "Drop .docx files or click to browse"}
              </div>
              <input ref={fileRef} type="file" accept=".docx" multiple hidden
                onChange={e => processFiles([...e.target.files])} />
            </div>

            {/* Template list */}
            <div style={{ flex: 1, overflow: "auto" }}>
              {templates.map(t => {
                const isSel = selected === t.id;
                const hasSchema = !!schemas[t.entity];
                const totalFields = t.results.length;
                return (
                  <div key={t.id} onClick={() => setSelected(t.id)} style={{
                    padding: "10px 14px", borderBottom: `1px solid ${C.border}`,
                    background: isSel ? C.accentGlow : "transparent",
                    borderLeft: `3px solid ${isSel ? C.accent : "transparent"}`,
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, wordBreak: "break-word", flex: 1 }}>{t.name}</div>
                      <button onClick={e => { e.stopPropagation(); removeTemplate(t.id); }}
                        style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>✕</button>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
                      <code style={{ fontSize: 10, color: hasSchema ? C.accent : C.yellow, background: hasSchema ? C.accentGlow : C.yellowDim, padding: "1px 5px", borderRadius: 4 }}>
                        {t.entity || "unknown"}
                      </code>
                      {t.autoMapped && <span style={{ fontSize: 10, color: C.purple }}>auto</span>}
                      {t.fail > 0 && pill(`${t.fail} fail`, C.red)}
                      {t.pass > 0 && pill(`${t.pass} pass`, C.green)}
                      {t.unknown > 0 && <span style={{ fontSize: 10, color: C.yellow }}>? {t.unknown}</span>}
                      {!hasSchema && <span style={{ fontSize: 10, color: C.muted }}>(schema not loaded)</span>}
                      <span style={{ fontSize: 10, color: C.muted }}>{totalFields} fields</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: detail */}
          <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
            {!selTemplate ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: C.muted, fontSize: 14 }}>
                {templates.length === 0
                  ? "Drop .docx templates on the left to begin"
                  : "Select a template to inspect fields"}
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{selTemplate.name}</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    {/* Entity selector */}
                    <select
                      value={selTemplate.entity}
                      onChange={e => updateTemplateEntity(selTemplate.id, e.target.value)}
                      style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.text, padding: "4px 8px", borderRadius: 6, fontSize: 12 }}>
                      <option value="">-- select entity --</option>
                      {ALL_ENTITIES.map(e => (
                        <option key={e} value={e}>{e}{schemas[e] ? " ✓" : ""}</option>
                      ))}
                    </select>
                    {pill(`${selTemplate.pass} pass`, C.green)}
                    {pill(`${selTemplate.fail} fail`, C.red)}
                    {selTemplate.unknown > 0 && pill(`${selTemplate.unknown} unvalidated`, C.yellow)}
                    {!schemas[selTemplate.entity] && selTemplate.entity && (
                      <span style={{ fontSize: 11, color: C.yellow }}>
                        ⚠ Schema not loaded — go to Schemas tab to load <code>{selTemplate.entity}</code>
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: C.purple }}>
                      ⊙ CRM = standard contact/account field (auto-recognized, no schema needed)
                    </span>
                  </div>
                </div>

                {/* Debug panel for 0-field templates */}
                {selTemplate.results.length === 0 && (
                  <div style={{ background: C.yellowDim, border: `1px solid ${C.yellow}40`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, color: C.yellow, marginBottom: 8 }}>⚠ No fields detected — diagnostic info</div>
                    <div style={{ fontSize: 12, color: C.dim, marginBottom: 8 }}>
                      This template may use a different field binding format. XML files found inside the DOCX:
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: C.text, lineHeight: 1.8 }}>
                      {(selTemplate.zipFiles || []).length === 0
                        ? "No XML files found — file may be corrupted or not a valid DOCX"
                        : (selTemplate.zipFiles || []).map((f, i) => (
                            <div key={i} style={{ color: f.startsWith("word/document") ? C.green : f.startsWith("customXml") ? C.accent : C.dim }}>
                              {f}
                            </div>
                          ))
                      }
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: C.muted }}>
                      If you see <code style={{color:C.accent}}>customXml/item*.xml</code> files above, please share one of those templates and we can adjust the parser. If no XML files appear, the file may not be a Word template with data bindings.
                    </div>
                  </div>
                )}

                {/* Field table */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: C.surfaceAlt }}>
                      {["#", "Field Name", "Entity", "Via Relationship", "Status", "Issue"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: C.muted, fontWeight: 700, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selTemplate.results.map((r, i) => {
                      const rowColor = r.status === "pass" ? C.greenDim : r.status === "fail" ? C.redDim : r.status === "system" ? C.purpleDim : C.yellowDim;
                      const statusColor = r.status === "pass" ? C.green : r.status === "fail" ? C.red : r.status === "system" ? C.purple : C.yellow;
                      return (
                        <tr key={i} style={{ background: i % 2 === 0 ? rowColor : "transparent", borderBottom: `1px solid ${C.border}30` }}>
                          <td style={{ padding: "6px 12px", color: C.muted }}>{i + 1}</td>
                          <td style={{ padding: "6px 12px" }}><code style={{ color: C.text }}>{r.fieldName}</code></td>
                          <td style={{ padding: "6px 12px" }}><code style={{ color: C.dim, fontSize: 11 }}>{r.entityName}</code></td>
                          <td style={{ padding: "6px 12px" }}><code style={{ color: C.muted, fontSize: 10 }}>{r.relationship || ""}</code></td>
                          <td style={{ padding: "6px 12px" }}>
                            <span style={{ color: statusColor, fontWeight: 700, fontSize: 11 }}>
                              {r.status === "pass" ? "✓ PASS" : r.status === "fail" ? "✗ FAIL" : r.status === "system" ? "⊙ CRM" : "? –"}
                            </span>
                          </td>
                          <td style={{ padding: "6px 12px", color: r.status === "system" ? C.purple : C.red, fontSize: 11 }}>{r.issues.join(", ") || r.note || ""}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}