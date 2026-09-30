/* =========================================
   PUENTE SHARED DATA STORE
   ========================================= */

const PUENTE_STORAGE_KEY = "puenteClientData";


/* -----------------------------------------
   DEFAULT DATA STRUCTURE
----------------------------------------- */

function createDefaultPuenteData() {

    return {

        schemaVersion: 1,

        profile: {
            businessName: "",
            ownerName: "",
            industry: "",
            location: "",
            products: "",
            customers: "",
            advantages: "",
            challenges: "",
            englishKeywords: "",
            spanishKeywords: ""
        },

        approvedFacts: {

            business: {
                hours: "",
                deliveryTerms: "",
                returnPolicy: "",
                notes: "",
                approvedBy: "",
                approvedAt: ""
            },

            products: []
        },

        authorizedChannels: [],

        auditItems: [],

        intelligence: {
            questions: [],
            checks: [],
            attr: [],
            links: [],
            recos: [],
            drafts: []
        },

        approvals: [],

        auditLog: [],

        meta: {
            updatedAt: ""
        }
    };
}


/* -----------------------------------------
   NORMALIZE SAVED DATA

   Prevents older versions from breaking when
   we add new fields later.
----------------------------------------- */

function normalizePuenteData(savedData) {

    const defaults = createDefaultPuenteData();

    const saved = savedData || {};

    return {

        ...defaults,
        ...saved,

        profile: {
            ...defaults.profile,
            ...(saved.profile || {})
        },

        approvedFacts: {

            business: {
                ...defaults.approvedFacts.business,
                ...(saved.approvedFacts?.business || {})
            },

            products:
                Array.isArray(
                    saved.approvedFacts?.products
                )
                    ? saved.approvedFacts.products
                    : []
        },

        authorizedChannels:
            Array.isArray(saved.authorizedChannels)
                ? saved.authorizedChannels
                : [],

        auditItems:
            Array.isArray(saved.auditItems)
                ? saved.auditItems
                : [],

        intelligence: {
            ...defaults.intelligence,
            ...(saved.intelligence || {})
        },

        approvals:
            Array.isArray(saved.approvals)
                ? saved.approvals
                : [],

        auditLog:
            Array.isArray(saved.auditLog)
                ? saved.auditLog
                : [],

        meta: {
            ...defaults.meta,
            ...(saved.meta || {})
        }
    };
}


/* -----------------------------------------
   GET DATA
----------------------------------------- */

function getPuenteData() {

    const saved =
        localStorage.getItem(
            PUENTE_STORAGE_KEY
        );

    if (!saved) {
        return createDefaultPuenteData();
    }

    try {

        const parsed =
            JSON.parse(saved);

        return normalizePuenteData(parsed);

    } catch (error) {

        console.error(
            "Could not read Puente data:",
            error
        );

        return createDefaultPuenteData();
    }
}


/* -----------------------------------------
   SAVE DATA
----------------------------------------- */

function savePuenteData(data) {

    const normalized =
        normalizePuenteData(data);

    normalized.meta.updatedAt =
        new Date().toISOString();

    localStorage.setItem(
        PUENTE_STORAGE_KEY,
        JSON.stringify(normalized)
    );


    /*
       Lets other Puente modules on the
       same page know that data changed.
    */

    window.dispatchEvent(
        new CustomEvent(
            "puente:data-changed",
            {
                detail: normalized
            }
        )
    );

    return normalized;
}


/* -----------------------------------------
   UPDATE DATA SAFELY

   IMPORTANT:
   Always read the newest version first.
   This prevents Person 1 and Person 2 from
   overwriting each other's sections.
----------------------------------------- */

function updatePuenteData(updateFunction) {

    const data =
        getPuenteData();

    updateFunction(data);

    return savePuenteData(data);
}


/* -----------------------------------------
   MIGRATE OLD PERSON 1 DATA

   This lets your existing demo data survive
   the move to the new structure.
----------------------------------------- */

function migrateLegacyPuenteData() {

    const data =
        getPuenteData();

    let changed = false;


    /* OLD CLIENT INTERVIEW */

    const legacyInterview =
        localStorage.getItem(
            "puenteInterview"
        );

    const profileHasData =
        Object.values(data.profile)
            .some(function(value) {

                return (
                    String(value || "")
                        .trim() !== ""
                );
            });


    if (
        legacyInterview &&
        !profileHasData
    ) {

        try {

            const interview =
                JSON.parse(
                    legacyInterview
                );

            data.profile = {
                ...data.profile,
                ...interview
            };

            changed = true;

        } catch (error) {

            console.error(
                "Could not migrate interview:",
                error
            );
        }
    }


    /* OLD DIGITAL AUDIT */

    const legacyAudit =
        localStorage.getItem(
            "puenteAuditItems"
        );

    if (
        legacyAudit &&
        data.auditItems.length === 0
    ) {

        try {

            const items =
                JSON.parse(
                    legacyAudit
                );

            if (Array.isArray(items)) {

                data.auditItems =
                    items;

                changed = true;
            }

        } catch (error) {

            console.error(
                "Could not migrate audit:",
                error
            );
        }
    }


    if (
        changed ||
        !localStorage.getItem(
            PUENTE_STORAGE_KEY
        )
    ) {

        savePuenteData(data);
    }
}


/* -----------------------------------------
   EXPOSE STORE TO ALL PUENTE FILES
----------------------------------------- */

window.PuenteStore = {

    key:
        PUENTE_STORAGE_KEY,

    get:
        getPuenteData,

    save:
        savePuenteData,

    update:
        updatePuenteData
};


/* RUN LEGACY MIGRATION */

migrateLegacyPuenteData();