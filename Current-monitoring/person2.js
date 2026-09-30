/* =========================================
   PUENTE INTELLIGENCE MODULE
   Sprint 2 — Discover / Build / Grow aligned
   ========================================= */

(function () {

    "use strict";

    if (!window.PuenteStore) {
        console.error(
            "Puente Intelligence: PuenteStore was not found. Load store.js before person2.js."
        );
        return;
    }


    /* =====================================
       CONSTANTS
    ===================================== */

    const ASSISTANTS = [
        "ChatGPT",
        "Gemini",
        "Copilot",
        "Claude",
        "Perplexity"
    ];


    const RESULTS = [
        "Not mentioned",
        "Mentioned - accurate",
        "Mentioned - inaccurate"
    ];


    const RISKY_TERMS = [
        "waterproof",
        "impermeable",
        "best",
        "mejor",
        "#1",
        "guarantee",
        "garantía",
        "lifetime",
        "de por vida",
        "cheapest",
        "más barato"
    ];

    /* =====================================
   CHANGE TYPES / GOVERNANCE
===================================== */

const CHANGE_TYPES = [

    {
        value: "Product Description",
        label: "Product Description",
        material: false
    },

    {
        value: "Search Keywords",
        label: "Search Keywords",
        material: false
    },

    {
        value: "Business Description",
        label: "Business Description",
        material: false
    },

    {
        value: "Price",
        label: "Price",
        material: true
    },

    {
        value: "SKU",
        label: "SKU",
        material: true
    },

    {
        value: "Availability",
        label: "Availability",
        material: true
    },

    {
        value: "Product Specifications",
        label: "Product Specifications",
        material: true
    },

    {
        value: "Warranty",
        label: "Warranty",
        material: true
    },

    {
        value: "Return Policy",
        label: "Return Policy",
        material: true
    },

    {
        value: "Delivery Terms",
        label: "Delivery Terms",
        material: true
    }

];

    /* =====================================
       BASIC HELPERS
    ===================================== */

    function $(id) {
        return document.getElementById(id);
    }


    function escapeHtml(value) {

        return String(value ?? "")
            .replace(
                /[&<>"']/g,
                function (character) {

                    const map = {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        "\"": "&quot;",
                        "'": "&#39;"
                    };

                    return map[character];
                }
            );
    }


    function createId(prefix) {

        return (
            prefix +
            "-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 7)
        );
    }


    function today() {

        return new Date()
            .toISOString()
            .slice(0, 10);
    }


    function slug(value) {

        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }


    function optionHtml(
        values,
        selectedValue
    ) {

        return values
            .map(
                function (value) {

                    return `
                        <option
                            value="${escapeHtml(value)}"
                            ${
                                value === selectedValue
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${escapeHtml(value)}
                        </option>
                    `;
                }
            )
            .join("");
    }


    function parseMoney(value) {

        const parsed =
            Number(
                String(value || "")
                    .replace(
                        /[^0-9.]/g,
                        ""
                    )
            );


        return Number.isFinite(parsed)
            ? parsed
            : null;
    }


    /* =====================================
       SHARED STORE HELPERS
    ===================================== */

    function getClientData() {

        return window.PuenteStore.get();
    }


    function getProfile() {

        return (
            getClientData().profile ||
            {}
        );
    }


    function getApprovedFacts() {

        const data =
            getClientData();


        return (
            data.approvedFacts ||
            {
                business: {},
                products: []
            }
        );
    }


    function getApprovedProducts() {

        const facts =
            getApprovedFacts();


        return Array.isArray(
            facts.products
        )
            ? facts.products
            : [];
    }


    function getIntelligence() {

        const data =
            getClientData();


        return (
            data.intelligence ||
            {
                questions: [],
                checks: [],
                attr: [],
                links: [],
                recos: [],
                drafts: []
            }
        );
    }


    function ensureIntelligenceShape(
        intelligence
    ) {

        [
            "questions",
            "checks",
            "attr",
            "links",
            "recos",
            "drafts"
        ].forEach(
            function (key) {

                if (
                    !Array.isArray(
                        intelligence[key]
                    )
                ) {

                    intelligence[key] =
                        [];
                }
            }
        );
    }


    function updateIntelligence(
        updateFunction
    ) {

        window.PuenteStore.update(
            function (data) {

                if (
                    !data.intelligence
                ) {

                    data.intelligence =
                        {};
                }


                ensureIntelligenceShape(
                    data.intelligence
                );


                updateFunction(
                    data.intelligence,
                    data
                );
            }
        );
    }


    /* =====================================
       OPTIONAL LEGACY PERSON 2 MIGRATION
    ===================================== */

    function migrateLegacyPerson2() {

        const legacyRaw =
            localStorage.getItem(
                "puentePerson2"
            );


        if (!legacyRaw) {
            return;
        }


        let legacy;


        try {

            legacy =
                JSON.parse(
                    legacyRaw
                );

        } catch (error) {

            console.warn(
                "Puente Intelligence: legacy Person 2 data could not be parsed."
            );

            return;
        }


        const migratableKeys = [
            "questions",
            "checks",
            "attr",
            "links",
            "recos",
            "drafts"
        ];


        const hasMigratableData =
            migratableKeys.some(
                function (key) {

                    return (
                        Array.isArray(
                            legacy[key]
                        ) &&
                        legacy[key].length > 0
                    );
                }
            );


        if (!hasMigratableData) {
            return;
        }


        updateIntelligence(
            function (intelligence) {

                migratableKeys.forEach(
                    function (key) {

                        if (
                            intelligence[key]
                                .length === 0 &&
                            Array.isArray(
                                legacy[key]
                            )
                        ) {

                            intelligence[key] =
                                legacy[key];
                        }
                    }
                );
            }
        );
    }


    /* =====================================
       AI DISCOVERY QUESTION GENERATION
    ===================================== */

    function generateQuestions() {

        const profile =
            getProfile();


        const products =
            getApprovedProducts();


        if (
            !profile.businessName
        ) {

            setMessage(
                "Save the Client Interview first."
            );

            return;
        }


        const city =
            (
                profile.location ||
                "El Paso"
            )
            .split(",")[0]
            .trim();


        const generated = [];


        /* ---------------------------------
           PRODUCT QUESTIONS
        --------------------------------- */

        products
            .filter(
                function (product) {

                    return (
                        product.approvalStatus ===
                        "Owner Approved"
                    );
                }
            )
            .slice(0, 4)
            .forEach(
                function (product) {

                    if (
                        !product.productName
                    ) {

                        return;
                    }


                    generated.push({

                        text:
                            `Where can I buy ${product.productName} in ${city}?`,

                        lang:
                            "English",

                        type:
                            "Product"
                    });


                    generated.push({

                        text:
                            `¿Dónde puedo comprar ${product.productName} en ${city}?`,

                        lang:
                            "Spanish",

                        type:
                            "Product"
                    });
                }
            );


        /* ---------------------------------
           KEYWORD QUESTIONS
        --------------------------------- */

        function keywordList(value) {

            return String(
                value || ""
            )
            .split(
                /[,;\n]/
            )
            .map(
                function (item) {

                    return item.trim();
                }
            )
            .filter(Boolean)
            .slice(0, 3);
        }


        keywordList(
            profile.englishKeywords
        )
        .forEach(
            function (keyword) {

                generated.push({

                    text:
                        `Where can I buy ${keyword} in ${city}?`,

                    lang:
                        "English",

                    type:
                        "Keyword"
                });
            }
        );


        keywordList(
            profile.spanishKeywords
        )
        .forEach(
            function (keyword) {

                generated.push({

                    text:
                        `¿Dónde comprar ${keyword} en ${city}?`,

                    lang:
                        "Spanish",

                    type:
                        "Keyword"
                });
            }
        );


        /* ---------------------------------
           BRAND QUESTIONS
        --------------------------------- */

        generated.push({

            text:
                `What is ${profile.businessName} known for in ${city}?`,

            lang:
                "English",

            type:
                "Brand"
        });


        generated.push({

            text:
                `¿Qué productos ofrece ${profile.businessName} en ${city}?`,

            lang:
                "Spanish",

            type:
                "Brand"
        });


        let added = 0;


        updateIntelligence(
            function (intelligence) {

                generated.forEach(
                    function (question) {

                        const exists =
                            intelligence
                                .questions
                                .some(
                                    function (
                                        existing
                                    ) {

                                        return (
                                            existing.text ===
                                            question.text
                                        );
                                    }
                                );


                        if (!exists) {

                            intelligence
                                .questions
                                .push({

                                    id:
                                        createId(
                                            "question"
                                        ),

                                    text:
                                        question.text,

                                    lang:
                                        question.lang,

                                    type:
                                        question.type
                                });


                            added++;
                        }
                    }
                );
            }
        );


        setMessage(
            added +
            " new AI discovery question(s) generated."
        );
    }


    /* =====================================
       LOG AI DISCOVERY CHECK
    ===================================== */

    function logDiscoveryCheck(
        questionId
    ) {

        const assistantElement =
            $(
                "assistant-" +
                questionId
            );


        const resultElement =
            $(
                "result-" +
                questionId
            );


        const answerElement =
            $(
                "answer-" +
                questionId
            );


        if (
            !assistantElement ||
            !resultElement ||
            !answerElement
        ) {

            return;
        }


        const assistant =
            assistantElement.value;


        const result =
            resultElement.value;


        const observedAnswer =
            answerElement
                .value
                .trim();


        updateIntelligence(
            function (intelligence) {

                intelligence
                    .checks
                    .push({

                        id:
                            createId(
                                "check"
                            ),

                        qid:
                            questionId,

                        assistant:
                            assistant,

                        result:
                            result,

                        observedAnswer:
                            observedAnswer,

                        date:
                            today(),

                        recordedAt:
                            new Date()
                                .toISOString(),

                        demo:
                            false
                    });
            }
        );


        setMessage(
            "AI discovery check saved."
        );
    }


 /* =====================================
   APPROVED-FACT CONTENT VALIDATION
===================================== */

function checkContentText(text) {

    const approvedFacts =
        getApprovedFacts();


    const products =
        getApprovedProducts()
            .filter(
                function (product) {

                    return (
                        product.approvalStatus ===
                        "Owner Approved"
                    );
                }
            );


    const issues = [];

    const confirmations = [];


    if (
        products.length === 0
    ) {

        issues.push(
            "No owner-approved products are available to validate this content."
        );


        return {
            issues:
                issues,

            confirmations:
                confirmations
        };
    }


    /* ---------------------------------
       PRICE VALIDATION
    --------------------------------- */

    const approvedPrices =
        products
            .map(
                function (product) {

                    return parseMoney(
                        product.price
                    );
                }
            )
            .filter(
                function (value) {

                    return (
                        value !== null
                    );
                }
            );


    const draftPrices =
        [
            ...String(text)
                .matchAll(
                    /\$\s?(\d+(?:\.\d+)?)/g
                )
        ];


    draftPrices.forEach(
        function (match) {

            const value =
                Number(
                    match[1]
                );


            if (
                !approvedPrices.includes(
                    value
                )
            ) {

                issues.push(
                    `Price $${value} does not match an owner-approved product price.`
                );

            } else {

                confirmations.push(
                    `Price $${value} matches the Approved Facts Brief.`
                );
            }
        }
    );


    /* ---------------------------------
       BUILD APPROVED SOURCE TEXT
    --------------------------------- */

    const truthText =
        [

            products
                .map(
                    function (product) {

                        return [

                            product.productName,
                            product.sku,
                            product.price,
                            product.availability,
                            product.specifications,
                            product.warranty,
                            product.ordering,
                            product.englishTerms,
                            product.spanishTerms

                        ]
                        .join(" ");
                    }
                )
                .join(" "),


            Object.values(
                approvedFacts.business ||
                {}
            )
            .join(" ")

        ]
        .join(" ")
        .toLowerCase();


    const lowerText =
        String(text)
            .toLowerCase();


    /* ---------------------------------
       UNSUPPORTED CLAIMS
    --------------------------------- */

    RISKY_TERMS.forEach(
        function (term) {

            if (
                lowerText.includes(
                    term
                ) &&
                !truthText.includes(
                    term
                )
            ) {

                issues.push(
                    `Unverified claim: "${term}" is not supported by the Approved Facts Brief.`
                );
            }
        }
    );


    /* ---------------------------------
       BUSINESS POLICY CLAIMS
    --------------------------------- */

    const businessFacts =
        approvedFacts.business ||
        {};


    const policyRules = [

        {
            field:
                "returnPolicy",

            label:
                "return policy",

            terms: [
                "return",
                "refund",
                "devolución",
                "reembolso"
            ]
        },

        {
            field:
                "deliveryTerms",

            label:
                "delivery / shipping",

            terms: [
                "free shipping",
                "shipping",
                "delivery",
                "envío gratis",
                "entrega"
            ]
        },

        {
            field:
                "hours",

            label:
                "business hours",

            terms: [
                "open until",
                "open today",
                "24/7",
                "abierto hasta"
            ]
        }

    ];


    policyRules.forEach(
        function (rule) {

            const mentionsPolicy =
                rule.terms.some(
                    function (term) {

                        return (
                            lowerText.includes(
                                term
                            )
                        );
                    }
                );


            if (
                mentionsPolicy &&
                !String(
                    businessFacts[
                        rule.field
                    ] ||
                    ""
                )
                .trim()
            ) {

                issues.push(
                    `The draft makes a ${rule.label} claim, but no approved ${rule.label} is on file.`
                );
            }
        }
    );


    return {
        issues:
            issues,

        confirmations:
            confirmations
    };
}


/* =====================================
   RISK CLASSIFICATION
===================================== */

function classifyChangeRisk(
    changeType,
    validationResult
) {

    const definition =
        CHANGE_TYPES.find(
            function (item) {

                return (
                    item.value ===
                    changeType
                );
            }
        );


    const reasons = [];


    if (
        validationResult
            .issues
            .length > 0
    ) {

        reasons.push(
            "The proposed content contains one or more conflicts with the Approved Facts Brief."
        );
    }


    if (
        definition &&
        definition.material
    ) {

        reasons.push(
            `${changeType} is classified as a material business field.`
        );
    }


    const approvalRequired =
        Boolean(
            (
                definition &&
                definition.material
            ) ||
            validationResult
                .issues
                .length > 0
        );


    if (
        approvalRequired
    ) {

        return {
            riskLevel:
                "Human Review Required",

            approvalRequired:
                true,

            automationEligible:
                false,

            reasons:
                reasons
        };
    }


    return {
        riskLevel:
            "Low Risk",

        approvalRequired:
            false,

        automationEligible:
            true,

        reasons: [
            "The change is descriptive and does not modify a material business field.",
            "No conflicts were found against the Approved Facts Brief."
        ]
    };
}


/* =====================================
   CHECK DRAFT
===================================== */

function checkDraft() {

    const draftElement =
        $("p2Draft");


    const changeTypeElement =
        $("p2ChangeType");


    if (
        !draftElement ||
        !changeTypeElement
    ) {

        return;
    }


    const text =
        draftElement
            .value
            .trim();


    const changeType =
        changeTypeElement.value;


    if (!text) {

        setMessage(
            "Enter content to check."
        );

        return;
    }


    const validationResult =
        checkContentText(
            text
        );


    const riskResult =
        classifyChangeRisk(
            changeType,
            validationResult
        );


    renderContentCheckResult(
        validationResult,
        riskResult
    );
}


/* =====================================
   SAVE DRAFT
===================================== */

function saveDraft() {

    const draftElement =
        $("p2Draft");


    const platformElement =
        $("p2DraftPlatform");


    const changeTypeElement =
        $("p2ChangeType");


    if (
        !draftElement ||
        !platformElement ||
        !changeTypeElement
    ) {

        return;
    }


    const text =
        draftElement
            .value
            .trim();


    const changeType =
        changeTypeElement.value;


    if (!text) {

        setMessage(
            "Enter content before saving a draft."
        );

        return;
    }


    const validationResult =
        checkContentText(
            text
        );


    const riskResult =
        classifyChangeRisk(
            changeType,
            validationResult
        );


    updateIntelligence(
        function (intelligence) {

            intelligence
                .drafts
                .push({

                    id:
                        createId(
                            "draft"
                        ),

                    date:
                        today(),

                    createdAt:
                        new Date()
                            .toISOString(),

                    platform:
                        platformElement.value,

                    changeType:
                        changeType,

                    text:
                        text,

                    issues:
                        validationResult.issues,

                    confirmations:
                        validationResult.confirmations,

                    riskLevel:
                        riskResult.riskLevel,

                    riskReasons:
                        riskResult.reasons,

                    approvalRequired:
                        riskResult.approvalRequired,

                    automationEligible:
                        riskResult.automationEligible,

                    status:
                        riskResult.approvalRequired
                            ? "Needs Human Review"
                            : "Ready for Automation",

                    ownerNote:
                        ""
                });
        }
    );


    renderContentCheckResult(
        validationResult,
        riskResult
    );


    setMessage(
        riskResult.approvalRequired
            ? "Draft saved and routed for human review."
            : "Draft saved as low-risk and automation eligible."
    );
}


/* =====================================
   GOVERNANCE WORKFLOW ROUTING
===================================== */

function routeDraft(
    draftId
) {

    PuenteStore.update(
        function(data) {

            const intelligence =
                data.intelligence;


            const draft =
                intelligence.drafts.find(
                    function(item) {

                        return (
                            item.id ===
                            draftId
                        );
                    }
                );


            if (!draft) {

                return;
            }


            /* ---------------------------------
               HUMAN REVIEW ROUTE
            --------------------------------- */

            if (
                draft.approvalRequired
            ) {

                const existingApproval =
                    data.approvals.find(
                        function(approval) {

                            return (
                                approval.draftId ===
                                draft.id &&
                                approval.status ===
                                "Pending Owner"
                            );
                        }
                    );


                /*
                   Prevent duplicate approval requests.
                */

                if (
                    !existingApproval
                ) {

                    data.approvals.push({

                        id:
                            createId(
                                "approval"
                            ),

                        draftId:
                            draft.id,

                        platform:
                            draft.platform,

                        changeType:
                            draft.changeType,

                        text:
                            draft.text,

                        riskLevel:
                            draft.riskLevel,

                        reasons:
                            draft.riskReasons ||
                            [],

                        status:
                            "Pending Owner",

                        createdAt:
                            new Date()
                                .toISOString(),

                        decidedAt:
                            "",

                        decision:
                            "",

                        ownerNote:
                            ""
                    });
                }


                draft.status =
                    "Pending Owner";


                draft.routedAt =
                    new Date()
                        .toISOString();


                data.auditLog.push({

                    id:
                        createId(
                            "audit"
                        ),

                    type:
                        "Approval Routing",

                    draftId:
                        draft.id,

                    platform:
                        draft.platform,

                    changeType:
                        draft.changeType,

                    action:
                        "Sent to owner for review",

                    status:
                        "Pending Owner",

                    timestamp:
                        new Date()
                            .toISOString()
                });


                return;
            }


            /* ---------------------------------
               LOW-RISK AUTOMATION ROUTE
            --------------------------------- */

            draft.status =
                "Implemented";


            draft.implementedAt =
                new Date()
                    .toISOString();


            draft.implementationMode =
                "Prototype Simulation";


            data.auditLog.push({

                id:
                    createId(
                        "audit"
                    ),

                type:
                    "Automated Implementation",

                draftId:
                    draft.id,

                platform:
                    draft.platform,

                changeType:
                    draft.changeType,

                action:
                    "Low-risk content change implemented",

                status:
                    "Implemented",

                mode:
                    "Prototype Simulation",

                timestamp:
                    new Date()
                        .toISOString()
            });
        }
    );


    setMessage(
        "Draft workflow updated."
    );
}
/* =====================================
   IMPLEMENT OWNER-APPROVED CHANGE
===================================== */

function implementApprovedDraft(
    draftId
) {

    let implemented =
        false;


    PuenteStore.update(
        function(data) {

            const intelligence =
                data.intelligence ||
                { drafts: [] };


            const drafts =
                intelligence.drafts ||
                [];


            const draft =
                drafts.find(
                    function(item) {

                        return (
                            item.id ===
                            draftId
                        );
                    }
                );


            if (!draft) {

                return;
            }


            /*
               Only owner-approved material
               changes can enter this route.
            */

            if (
                draft.status !==
                "Approved for Implementation"
            ) {

                return;
            }


            if (
                draft.ownerApproved !==
                true
            ) {

                return;
            }


            const timestamp =
                new Date()
                    .toISOString();


            /* -------------------------
               IMPLEMENT DRAFT
            ------------------------- */

            draft.status =
                "Implemented";


            draft.implementedAt =
                timestamp;


            draft.implementationMode =
                "Human-Approved Prototype Simulation";


            /* -------------------------
               UPDATE APPROVAL RECORD
            ------------------------- */

            const approval =
                (
                    data.approvals ||
                    []
                )
                .find(
                    function(item) {

                        return (
                            item.draftId ===
                            draft.id &&
                            item.decision ===
                            "Approved"
                        );
                    }
                );


            if (approval) {

                approval
                    .implementationStatus =
                    "Implemented";


                approval
                    .implementedAt =
                    timestamp;
            }


            /* -------------------------
               AUDIT LOG
            ------------------------- */

            data.auditLog =
                data.auditLog ||
                [];


            data.auditLog.push({

                id:
                    createId(
                        "audit"
                    ),

                type:
                    "Approved Implementation",

                draftId:
                    draft.id,

                approvalId:
                    approval
                        ? approval.id
                        : "",

                platform:
                    draft.platform,

                changeType:
                    draft.changeType,

                action:
                    "Owner-approved change implemented",

                status:
                    "Implemented",

                mode:
                    "Human-Approved Prototype Simulation",

                timestamp:
                    timestamp
            });


            implemented =
                true;
        }
    );


    if (
        implemented
    ) {

        setMessage(
            "Owner-approved change marked as implemented."
        );

    } else {

        setMessage(
            "This change is not ready for implementation."
        );
    }
}
    /* =====================================
       TRACKED LINK / ATTRIBUTION
    ===================================== */

    function createTrackedLink() {

        const baseElement =
            $("p2BaseUrl");


        const sourceElement =
            $("p2Source");


        const campaignElement =
            $("p2Campaign");


        if (
            !baseElement ||
            !sourceElement ||
            !campaignElement
        ) {

            return;
        }


        const baseUrl =
            baseElement
                .value
                .trim();


        const source =
            sourceElement
                .value
                .trim();


        const campaign =
            campaignElement
                .value
                .trim();


        if (!baseUrl) {

            setMessage(
                "Enter a website URL first."
            );

            return;
        }


        const separator =
            baseUrl.includes("?")
                ? "&"
                : "?";


        const url =
            baseUrl +
            separator +
            "utm_source=" +
            slug(
                source ||
                "puente"
            ) +
            "&utm_medium=puente" +
            "&utm_campaign=" +
            slug(
                campaign ||
                "general"
            );


        updateIntelligence(
            function (intelligence) {

                intelligence
                    .links
                    .push({

                        id:
                            createId(
                                "link"
                            ),

                        date:
                            today(),

                        source:
                            source ||
                            "Puente",

                        campaign:
                            campaign ||
                            "General",

                        url:
                            url
                    });
            }
        );


        const output =
            $("p2LinkOutput");


        if (output) {

            output.textContent =
                url;
        }


        setMessage(
            "Tracked link created."
        );
    }


    function logAttributionEvent() {

        const sourceElement =
            $("p2EventSource");


        const typeElement =
            $("p2EventType");


        const valueElement =
            $("p2EventValue");


        if (
            !sourceElement ||
            !typeElement ||
            !valueElement
        ) {

            return;
        }


        const source =
            sourceElement
                .value
                .trim();


        const event =
            typeElement.value;


        const value =
            Number(
                valueElement.value ||
                0
            );


        updateIntelligence(
            function (intelligence) {

                intelligence
                    .attr
                    .push({

                        id:
                            createId(
                                "event"
                            ),

                        date:
                            today(),

                        recordedAt:
                            new Date()
                                .toISOString(),

                        source:
                            source ||
                            "Puente",

                        event:
                            event,

                        value:
                            value,

                        demo:
                            false
                    });
            }
        );


        setMessage(
            "Attribution event saved."
        );
    }


    /* =====================================
       RECOMMENDATIONS
    ===================================== */

    function generateRecommendations() {

        const data =
            getClientData();


        const intelligence =
            data.intelligence;


        ensureIntelligenceShape(
            intelligence
        );


        const recommendations = [];


        const latestByQuestion = {};


        intelligence.checks
            .forEach(
                function (check) {

                    const key =
                        check.qid +
                        "|" +
                        check.assistant;


                    latestByQuestion[
                        key
                    ] =
                        check;
                }
            );


        Object.values(
            latestByQuestion
        )
        .forEach(
            function (check) {

                const question =
                    intelligence
                        .questions
                        .find(
                            function (item) {

                                return (
                                    item.id ===
                                    check.qid
                                );
                            }
                        );


                const questionText =
                    question
                        ? question.text
                        : "AI discovery question";


                if (
                    check.result ===
                    "Not mentioned"
                ) {

                    recommendations.push(
                        `Improve authorized public content for "${questionText}" and retest.`
                    );
                }


                if (
                    check.result ===
                    "Mentioned - inaccurate"
                ) {

                    recommendations.push(
                        `Investigate the inaccurate response for "${questionText}", correct authorized source information, and retest.`
                    );
                }
            }
        );


        if (
            intelligence.attr.length ===
            0
        ) {

            recommendations.push(
                "Create a tracked link and begin logging attributable activity so Puente can connect discovery work to business outcomes."
            );
        }


        if (
            recommendations.length ===
            0
        ) {

            recommendations.push(
                "Continue monitoring current AI discovery questions and compare future results with the current baseline."
            );
        }


        let added = 0;


        updateIntelligence(
            function (
                intelligenceData
            ) {

                recommendations.forEach(
                    function (text) {

                        const exists =
                            intelligenceData
                                .recos
                                .some(
                                    function (
                                        recommendation
                                    ) {

                                        return (
                                            recommendation
                                                .text ===
                                            text &&

                                            recommendation
                                                .status !==
                                            "Done"
                                        );
                                    }
                                );


                        if (!exists) {

                            intelligenceData
                                .recos
                                .push({

                                    id:
                                        createId(
                                            "reco"
                                        ),

                                    date:
                                        today(),

                                    text:
                                        text,

                                    status:
                                        "Open"
                                });


                            added++;
                        }
                    }
                );
            }
        );


        setMessage(
            added +
            " new recommendation(s) saved."
        );
    }


    /* =====================================
       RENDER HELPERS
    ===================================== */

    function setMessage(message) {

        const element =
            $("p2Message");


        if (element) {

            element.textContent =
                message;
        }
    }


    function getLatestChecks() {

        const intelligence =
            getIntelligence();


        const latestMap = {};


        intelligence.checks
            .forEach(
                function (check) {

                    const key =
                        check.qid +
                        "|" +
                        check.assistant;


                    const previous =
                        latestMap[key];


                    if (!previous) {

                        latestMap[key] =
                            check;

                        return;
                    }


                    const currentStamp =
                        check.recordedAt ||
                        check.date ||
                        "";


                    const previousStamp =
                        previous.recordedAt ||
                        previous.date ||
                        "";


                    if (
                        currentStamp >=
                        previousStamp
                    ) {

                        latestMap[key] =
                            check;
                    }
                }
            );


        return Object.values(
            latestMap
        );
    }


    function calculateLanguageInclusion(
        latestChecks,
        questionById,
        acceptedLanguages
    ) {

        const languageChecks =
            latestChecks.filter(
                function (check) {

                    const question =
                        questionById[
                            check.qid
                        ];


                    if (!question) {

                        return false;
                    }


                    return acceptedLanguages
                        .includes(
                            question.lang
                        );
                }
            );


        if (
            languageChecks.length ===
            0
        ) {

            return null;
        }


        const included =
            languageChecks.filter(
                function (check) {

                    return (
                        check.result !==
                        "Not mentioned"
                    );
                }
            ).length;


        return Math.round(
            included /
            languageChecks.length *
            100
        );
    }


    function renderSummary() {

        const intelligence =
            getIntelligence();


        const questions =
            intelligence.questions ||
            [];


        const events =
            intelligence.attr ||
            [];


        const latestChecks =
            getLatestChecks();


        /* ---------------------------------
           AI INCLUSION
        --------------------------------- */

        const mentionedChecks =
            latestChecks.filter(
                function (check) {

                    return (
                        check.result !==
                        "Not mentioned"
                    );
                }
            );


        const inclusionRate =
            latestChecks.length > 0

                ? Math.round(
                    mentionedChecks.length /
                    latestChecks.length *
                    100
                )

                : 0;


        /* ---------------------------------
           FACTUAL ACCURACY
        --------------------------------- */

        const accurateChecks =
            mentionedChecks.filter(
                function (check) {

                    return (
                        check.result ===
                        "Mentioned - accurate"
                    );
                }
            );


        const accuracyRate =
            mentionedChecks.length > 0

                ? Math.round(
                    accurateChecks.length /
                    mentionedChecks.length *
                    100
                )

                : null;


        /* ---------------------------------
           LANGUAGE PARITY
        --------------------------------- */

        const questionById = {};


        questions.forEach(
            function (question) {

                questionById[
                    question.id
                ] =
                    question;
            }
        );


        const englishRate =
            calculateLanguageInclusion(

                latestChecks,

                questionById,

                [
                    "English",
                    "en"
                ]
            );


        const spanishRate =
            calculateLanguageInclusion(

                latestChecks,

                questionById,

                [
                    "Spanish",
                    "es"
                ]
            );


        let parityValue =
            "—";


        let parityDetail =
            "Need English and Spanish checks";


        if (
            englishRate !== null &&
            spanishRate !== null
        ) {

            const gap =
                Math.abs(
                    englishRate -
                    spanishRate
                );


            parityValue =
                gap +
                " pt gap";


            parityDetail =
                "EN " +
                englishRate +
                "% | ES " +
                spanishRate +
                "%";
        }


        /* ---------------------------------
           ATTRIBUTED SALES
        --------------------------------- */

        const attributedSales =
            events
                .filter(
                    function (event) {

                        return (
                            event.event ===
                            "Sale"
                        );
                    }
                )
                .reduce(
                    function (
                        total,
                        event
                    ) {

                        return (
                            total +
                            Number(
                                event.value ||
                                0
                            )
                        );
                    },
                    0
                );


        const summary =
            $("p2Summary");


        if (!summary) {
            return;
        }


        summary.innerHTML = `

            <div class="card-container">


                <div class="card">

                    <h3>
                        AI Inclusion
                    </h3>

                    <p class="metric">
                        ${inclusionRate}%
                    </p>

                    <small>
                        Latest monitored AI responses
                    </small>

                </div>


                <div class="card">

                    <h3>
                        Factual Accuracy
                    </h3>

                    <p class="metric">

                        ${
                            accuracyRate === null
                                ? "—"
                                : accuracyRate + "%"
                        }

                    </p>

                    <small>
                        Accuracy when the business appears
                    </small>

                </div>


                <div class="card">

                    <h3>
                        Language Parity
                    </h3>

                    <p class="metric">
                        ${parityValue}
                    </p>

                    <small>
                        ${parityDetail}
                    </small>

                </div>


                <div class="card">

                    <h3>
                        Attributed Sales
                    </h3>

                    <p class="metric">
                        $${attributedSales.toLocaleString()}
                    </p>

                    <small>
                        Through Puente-tracked activity
                    </small>

                </div>


            </div>
        `;
    }


    function renderQuestions() {

        const intelligence =
            getIntelligence();


        const container =
            $("p2Questions");


        if (!container) {
            return;
        }


        if (
            intelligence.questions.length ===
            0
        ) {

            container.innerHTML = `

                <p class="empty-message">
                    No AI discovery questions yet.
                </p>

            `;


            return;
        }


        container.innerHTML = `

            <div class="p2-table-wrap">

                <table>

                    <thead>

                        <tr>

                            <th>
                                Question
                            </th>

                            <th>
                                Assistant
                            </th>

                            <th>
                                Result
                            </th>

                            <th>
                                Observed Answer
                            </th>

                            <th>
                                Log
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            intelligence
                                .questions
                                .map(
                                    function (
                                        question
                                    ) {

                                        const loggedCount =
                                            intelligence
                                                .checks
                                                .filter(
                                                    function (
                                                        check
                                                    ) {

                                                        return (
                                                            check.qid ===
                                                            question.id
                                                        );
                                                    }
                                                )
                                                .length;


                                        return `

                                            <tr>


                                                <td>

                                                    <strong>
                                                        ${escapeHtml(
                                                            question.text
                                                        )}
                                                    </strong>

                                                    <br>

                                                    <small>

                                                        ${escapeHtml(
                                                            question.lang
                                                        )}

                                                        •

                                                        ${escapeHtml(
                                                            question.type
                                                        )}

                                                        •

                                                        ${loggedCount}
                                                        logged

                                                    </small>

                                                </td>


                                                <td>

                                                    <select
                                                        id="assistant-${question.id}"
                                                    >

                                                        ${
                                                            optionHtml(
                                                                ASSISTANTS,
                                                                "ChatGPT"
                                                            )
                                                        }

                                                    </select>

                                                </td>


                                                <td>

                                                    <select
                                                        id="result-${question.id}"
                                                    >

                                                        ${
                                                            optionHtml(
                                                                RESULTS,
                                                                "Not mentioned"
                                                            )
                                                        }

                                                    </select>

                                                </td>


                                                <td>

                                                    <textarea
                                                        id="answer-${question.id}"
                                                        placeholder="Optional: paste or summarize the AI response"
                                                    ></textarea>

                                                </td>


                                                <td>

                                                    <button
                                                        type="button"
                                                        data-log-check="${question.id}"
                                                    >
                                                        Log Check
                                                    </button>

                                                </td>


                                            </tr>

                                        `;
                                    }
                                )
                                .join("")
                        }

                    </tbody>

                </table>

            </div>
        `;
    }


    function renderContentCheckResult(
    validationResult,
    riskResult
) {

    const output =
        $("p2CheckOutput");


    if (!output) {

        return;
    }


    let html = "";


    /* =================================
       RISK RESULT
    ================================= */

    if (
        riskResult.approvalRequired
    ) {

        html += `

            <div
                class="p2-item p2-review"
            >

                <strong>
                    HUMAN REVIEW REQUIRED
                </strong>

                <br>

                This change cannot be implemented
                automatically.

            </div>

        `;

    } else {

        html += `

            <div
                class="p2-item p2-auto"
            >

                <strong>
                    LOW RISK — AUTOMATION ELIGIBLE
                </strong>

                <br>

                This change may be implemented
                automatically using approved facts.

            </div>

        `;
    }


    /* =================================
       WHY IT RECEIVED THAT CLASSIFICATION
    ================================= */

    riskResult.reasons
        .forEach(
            function(reason) {

                html += `

                    <div class="p2-risk-reason">

                        ${escapeHtml(
                            reason
                        )}

                    </div>

                `;
            }
        );


    /* =================================
       VALIDATION ISSUES
    ================================= */

    if (
        validationResult
            .issues
            .length > 0
    ) {

        validationResult
            .issues
            .forEach(
                function(issue) {

                    html += `

                        <div
                            class="p2-item p2-flag"
                        >

                            ⚠
                            ${escapeHtml(
                                issue
                            )}

                        </div>

                    `;
                }
            );

    } else {

        html += `

            <div
                class="p2-item p2-good"
            >

                ✓ No conflicts found with
                the Approved Facts Brief.

            </div>

        `;
    }


    /* =================================
       CONFIRMED FACTS
    ================================= */

    validationResult
        .confirmations
        .forEach(
            function(
                confirmation
            ) {

                html += `

                    <div
                        class="p2-item p2-good"
                    >

                        ✓
                        ${escapeHtml(
                            confirmation
                        )}

                    </div>

                `;
            }
        );


    output.innerHTML =
        html;
}


    function renderAttribution() {

        const intelligence =
            getIntelligence();


        const container =
            $("p2Attribution");


        if (!container) {
            return;
        }


        if (
            intelligence.attr.length ===
            0
        ) {

            container.innerHTML = `

                <p class="empty-message">
                    No attributable activity
                    recorded yet.
                </p>

            `;


            return;
        }


        const totals = {};


        intelligence.attr
            .forEach(
                function (event) {

                    if (
                        !totals[
                            event.source
                        ]
                    ) {

                        totals[
                            event.source
                        ] = {

                            visits: 0,

                            sales: 0
                        };
                    }


                    if (
                        event.event ===
                        "Visit"
                    ) {

                        totals[
                            event.source
                        ].visits++;
                    }


                    if (
                        event.event ===
                        "Sale"
                    ) {

                        totals[
                            event.source
                        ].sales +=
                            Number(
                                event.value ||
                                0
                            );
                    }
                }
            );


        container.innerHTML = `

            <table>

                <thead>

                    <tr>

                        <th>
                            Source
                        </th>

                        <th>
                            Visits
                        </th>

                        <th>
                            Attributed Sales
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${
                        Object
                            .entries(
                                totals
                            )
                            .map(
                                function (
                                    entry
                                ) {

                                    const source =
                                        entry[0];


                                    const values =
                                        entry[1];


                                    return `

                                        <tr>

                                            <td>
                                                ${escapeHtml(
                                                    source
                                                )}
                                            </td>

                                            <td>
                                                ${values.visits}
                                            </td>

                                            <td>
                                                $${values.sales.toLocaleString()}
                                            </td>

                                        </tr>

                                    `;
                                }
                            )
                            .join("")
                    }

                </tbody>

            </table>
        `;
    }


    function renderDrafts() {

    const intelligence =
        getIntelligence();


    const container =
        $("p2DraftList");


    if (!container) {

        return;
    }


    if (
        intelligence
            .drafts
            .length === 0
    ) {

        container.innerHTML = `

            <p class="empty-message">
                No content drafts saved yet.
            </p>

        `;


        return;
    }


    container.innerHTML =
        intelligence
            .drafts
            .slice()
            .reverse()
            .map(
                function(draft) {

                    const issues =
                        Array.isArray(
                            draft.issues
                        )
                            ? draft.issues
                            : [];


                    const reasons =
                        Array.isArray(
                            draft.riskReasons
                        )
                            ? draft.riskReasons
                            : [];


                    let actionHtml =
                        "";


                    /* -------------------------
                       READY FOR AUTOMATION
                    ------------------------- */

                    if (
                        draft.status ===
                        "Ready for Automation"
                    ) {

                        actionHtml = `

                            <button
                                type="button"
                                data-route-draft="${draft.id}"
                            >
                                Simulate Implementation
                            </button>

                        `;
                    }


                    /* -------------------------
                       NEEDS HUMAN REVIEW
                    ------------------------- */

                    else if (
                        draft.status ===
                        "Needs Human Review"
                    ) {

                        actionHtml = `

                            <button
                                type="button"
                                data-route-draft="${draft.id}"
                            >
                                Send to Owner
                            </button>

                        `;
                    }


                    /* -------------------------
                       WAITING FOR OWNER
                    ------------------------- */

                    else if (
                        draft.status ===
                        "Pending Owner"
                    ) {

                        actionHtml = `

                            <div
                                class="p2-waiting"
                            >
                                Waiting for owner decision
                            </div>

                        `;
                    }

else if (
    draft.status ===
    "Approved for Implementation"
) {

    actionHtml = `

        <button
            type="button"
            data-implement-approved="${draft.id}"
        >
            Simulate Approved Implementation
        </button>

    `;
}
                    /* -------------------------
                       IMPLEMENTED
                    ------------------------- */

                    else if (
                        draft.status ===
                        "Implemented"
                    ) {

                        actionHtml = `

                            <div
                                class="p2-implemented"
                            >
                                ✓ Implemented
                            </div>

                        `;
                    }
else if (
    draft.status ===
    "Changes Requested"
) {

    actionHtml = `

        <div class="p2-waiting">

            Owner requested changes

        </div>

    `;
}


else if (
    draft.status ===
    "Rejected"
) {

    actionHtml = `

        <div class="p2-rejected">

            Owner rejected this change

        </div>

    `;
}

                    return `

                        <div
                            class="
                                p2-item
                                ${
                                    draft.approvalRequired
                                        ? "p2-review"
                                        : "p2-auto"
                                }
                            "
                        >

                            <strong>
                                ${escapeHtml(
                                    draft.platform
                                )}
                            </strong>

                            •

                            ${escapeHtml(
                                draft.changeType ||
                                "Content"
                            )}


                            <br>


                            <strong>

                                ${
                                    draft.approvalRequired
                                        ? "HUMAN REVIEW REQUIRED"
                                        : "LOW RISK — AUTOMATION ELIGIBLE"
                                }

                            </strong>


                            <br>


                            <small>

                                Status:
                                ${escapeHtml(
                                    draft.status
                                )}

                            </small>


                            <p>
                                ${escapeHtml(
                                    draft.text
                                )}
                            </p>


                            ${
                                reasons
                                    .map(
                                        function(reason) {

                                            return `

                                                <div
                                                    class="p2-risk-reason"
                                                >
                                                    ${escapeHtml(
                                                        reason
                                                    )}
                                                </div>

                                            `;
                                        }
                                    )
                                    .join("")
                            }


                            ${
                                issues
                                    .map(
                                        function(issue) {

                                            return `

                                                <div>
                                                    ⚠
                                                    ${escapeHtml(
                                                        issue
                                                    )}
                                                </div>

                                            `;
                                        }
                                    )
                                    .join("")
                            }


                            <div
                                class="p2-draft-action"
                            >
                                ${actionHtml}
                            </div>

                        </div>

                    `;
                }
            )
            .join("");
}

/* =====================================
   GOVERNANCE HISTORY
===================================== */

function renderGovernanceLog() {

    const container =
        $("p2GovernanceLog");


    if (!container) {

        return;
    }


    const data =
        PuenteStore.get();


    const log =
        Array.isArray(
            data.auditLog
        )
            ? data.auditLog
            : [];


    if (
        log.length ===
        0
    ) {

        container.innerHTML = `

            <p class="empty-message">

                No governance activity
                recorded yet.

            </p>

        `;


        return;
    }


    const recent =
        log
            .slice()
            .reverse()
            .slice(
                0,
                12
            );


    container.innerHTML =
        recent
            .map(
                function(entry) {

                    let displayTime =
                        entry.timestamp ||
                        "";


                    if (
                        entry.timestamp
                    ) {

                        const parsed =
                            new Date(
                                entry.timestamp
                            );


                        if (
                            !Number.isNaN(
                                parsed.getTime()
                            )
                        ) {

                            displayTime =
                                parsed
                                    .toLocaleString();
                        }
                    }


                    const result =
                        entry.decision ||
                        entry.status ||
                        "";


                    return `

                        <div
                            class="p2-governance-row"
                        >

                            <div>

                                <strong>
                                    ${escapeHtml(
                                        entry.type ||
                                        "Governance Activity"
                                    )}
                                </strong>

                                <p>
                                    ${escapeHtml(
                                        entry.action ||
                                        ""
                                    )}
                                </p>

                                <small>

                                    ${escapeHtml(
                                        entry.platform ||
                                        ""
                                    )}

                                    ${
                                        entry.changeType
                                            ? " • " +
                                              escapeHtml(
                                                  entry.changeType
                                              )
                                            : ""
                                    }

                                </small>

                            </div>


                            <div
                                class="p2-governance-meta"
                            >

                                ${
                                    result

                                        ? `

                                            <strong>
                                                ${escapeHtml(
                                                    result
                                                )}
                                            </strong>

                                          `

                                        : ""
                                }

                                <small>
                                    ${escapeHtml(
                                        displayTime
                                    )}
                                </small>

                            </div>

                        </div>

                    `;
                }
            )
            .join("");
}
    function renderRecommendations() {

        const intelligence =
            getIntelligence();


        const container =
            $("p2Recommendations");


        if (!container) {
            return;
        }


        if (
            intelligence.recos.length ===
            0
        ) {

            container.innerHTML = `

                <p class="empty-message">
                    No recommendations
                    generated yet.
                </p>

            `;


            return;
        }


        container.innerHTML =
            intelligence
                .recos
                .slice()
                .reverse()
                .map(
                    function (
                        recommendation
                    ) {

                        return `

                            <div
                                class="p2-item"
                            >

                                <small>

                                    ${escapeHtml(
                                        recommendation.date
                                    )}

                                    •

                                    ${escapeHtml(
                                        recommendation.status
                                    )}

                                </small>

                                <br>

                                ${escapeHtml(
                                    recommendation.text
                                )}

                            </div>

                        `;
                    }
                )
                .join("");
    }


    function render() {

        if (
            !$("person2")
        ) {

            return;
        }


        renderSummary();

renderQuestions();

renderAttribution();

renderDrafts();

renderGovernanceLog();

renderRecommendations();
    }


    /* =====================================
       BUILD GROW / INTELLIGENCE PAGE
    ===================================== */

    function buildPage() {

        const main =
            document.querySelector(
                "main"
            );


        if (!main) {

            return;
        }


        if (
            $("person2")
        ) {

            render();

            return;
        }


        /* ---------------------------------
           PAGE-SPECIFIC STYLES
        --------------------------------- */

        const style =
            document.createElement(
                "style"
            );


        style.textContent = 
        `

            #person2 .p2-item {

                background:
                    #f3f4f6;

                padding:
                    12px;

                margin:
                    10px 0;

                border-left:
                    4px solid
                    #111827;

                border-radius:
                    4px;
            }


            #person2 .p2-flag {

                background:
                    #fff7ed;

                border-left-color:
                    #c2410c;
            }


            #person2 .p2-good {

                background:
                    #f0fdf4;

                border-left-color:
                    #15803d;
            }


            #person2 .p2-row {

                display:
                    grid;

                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(
                            180px,
                            1fr
                        )
                    );

                gap:
                    12px;

                margin-top:
                    10px;
            }


            #person2 button {

                margin-top:
                    8px;

                padding:
                    10px
                    15px;

                border:
                    none;

                border-radius:
                    6px;

                background-color:
                    #041E42;

                color:
                    white;

                cursor:
                    pointer;
            }


            #person2 button:hover {

                background-color:
                    #0b2d5c;
            }


            #person2 textarea {

                min-height:
                    70px;
            }


            #person2 .p2-table-wrap {

                width:
                    100%;

                overflow-x:
                    auto;
            }


            #person2 small {

                color:
                    #6b7280;

                line-height:
                    1.35;
            }
                    #person2 .p2-draft-action {

    margin-top:
        12px;
}


#person2 .p2-waiting {

    display:
        inline-block;

    margin-top:
        8px;

    padding:
        8px 12px;

    border-radius:
        6px;

    background:
        #fff7ed;

    color:
        #9a3412;

    font-weight:
        700;
}


#person2 .p2-implemented {

    display:
        inline-block;

    margin-top:
        8px;

    padding:
        8px 12px;

    border-radius:
        6px;

    background:
        #f0fdf4;

    color:
        #166534;

    font-weight:
        700;
}

        `;


        document.head
            .appendChild(
                style
            );


        /* ---------------------------------
           PAGE SECTION
        --------------------------------- */

        const section =
            document.createElement(
                "section"
            );


        section.id =
            "person2";


        section.className =
            "page";


        section.innerHTML = `


            <p
                class="
                    stage-kicker
                    grow
                "
            >
                GROW
            </p>


            <h2>
                Intelligence & Measurement
            </h2>


            <p>

                Retest how the business appears in
                AI-assisted shopping, compare responses
                against owner-approved facts, and measure
                what improves over time.

            </p>


            <div
                id="p2Summary"
            ></div>


            <p
                id="p2Message"
                class="empty-message"
            ></p>


            <!-- =========================
                 1. AI DISCOVERY
            ========================== -->

            <div
                class="panel"
            >

                <h3>
                    1. AI Discovery Monitoring
                </h3>


                <p
                    class="empty-message"
                >

                    Generate bilingual shopping
                    questions from the Client Interview
                    and Approved Facts Brief, then record
                    how each AI assistant responds.

                </p>


                <button
                    type="button"
                    id="p2GenerateQuestions"
                >
                    Generate Questions
                </button>


                <div
                    id="p2Questions"
                ></div>

            </div>


            <!-- =========================
                 2. CONTENT VALIDATION
            ========================== -->

            <div
                class="panel"
            >

                <h3>
                    2. Approved-Fact Content Validation
                </h3>


                <p
                    class="empty-message"
                >

                    Validate proposed public content
                    against the owner-approved source
                    of truth before implementation.

                </p>


                <textarea
                    id="p2Draft"
                    placeholder="Example: Steel Toe Work Boot — now only $89 and waterproof."
                ></textarea>

<label>
    Change Type
</label>


<select
    id="p2ChangeType"
>

    <option value="Product Description">
        Product Description
    </option>

    <option value="Search Keywords">
        Search Keywords
    </option>

    <option value="Business Description">
        Business Description
    </option>

    <option value="Price">
        Price
    </option>

    <option value="SKU">
        SKU
    </option>

    <option value="Availability">
        Availability
    </option>

    <option value="Product Specifications">
        Product Specifications
    </option>

    <option value="Warranty">
        Warranty
    </option>

    <option value="Return Policy">
        Return Policy
    </option>

    <option value="Delivery Terms">
        Delivery Terms
    </option>

</select>
                <label>
                    Platform
                </label>


                <select
                    id="p2DraftPlatform"
                >

                    <option>
                        Website
                    </option>

                    <option>
                        Google Business
                    </option>

                    <option>
                        Yelp
                    </option>

                    <option>
                        Marketplace
                    </option>

                </select>


                <button
                    type="button"
                    id="p2CheckDraft"
                >
                    Check Against Approved Facts
                </button>


                <button
                    type="button"
                    id="p2SaveDraft"
                >
                    Save Draft
                </button>


                <div
                    id="p2CheckOutput"
                ></div>


                <h4>
                    Saved Drafts
                </h4>


                <div
                    id="p2DraftList"
                ></div>
<h4
    style="margin-top: 28px;"
>
    Governance History
</h4>


<p class="empty-message">

    Puente records automated actions,
    approval routing, owner decisions,
    and final implementation.

</p>


<div
    id="p2GovernanceLog"
></div>
            </div>


            <!-- =========================
                 3. ATTRIBUTION
            ========================== -->

            <div
                class="panel"
            >

                <h3>
                    3. Attribution Tracking
                </h3>


                <p
                    class="empty-message"
                >

                    Create Puente-tracked links and
                    record attributable visits or sales
                    without claiming credit for unrelated
                    business growth.

                </p>


                <div
                    class="p2-row"
                >

                    <input
                        id="p2BaseUrl"
                        placeholder="https://business.com/product"
                    >


                    <input
                        id="p2Source"
                        placeholder="Source, e.g. ChatGPT"
                    >


                    <input
                        id="p2Campaign"
                        placeholder="Campaign, e.g. steel-toe"
                    >

                </div>


                <button
                    type="button"
                    id="p2CreateLink"
                >
                    Create Tracked Link
                </button>


                <p
                    id="p2LinkOutput"
                    class="empty-message"
                ></p>


                <div
                    class="p2-row"
                >

                    <input
                        id="p2EventSource"
                        placeholder="Source"
                    >


                    <select
                        id="p2EventType"
                    >

                        <option
                            value="Visit"
                        >
                            Visit
                        </option>


                        <option
                            value="Sale"
                        >
                            Sale
                        </option>

                    </select>


                    <input
                        id="p2EventValue"
                        type="number"
                        min="0"
                        placeholder="Sale amount"
                    >

                </div>


                <button
                    type="button"
                    id="p2LogEvent"
                >
                    Log Result
                </button>


                <div
                    id="p2Attribution"
                ></div>

            </div>


            <!-- =========================
                 4. RECOMMENDATIONS
            ========================== -->

            <div
                class="panel"
            >

                <h3>
                    4. Recommendations
                </h3>


                <p
                    class="empty-message"
                >

                    Convert the latest monitoring
                    results into specific next actions
                    for Puente.

                </p>


                <button
                    type="button"
                    id="p2GenerateRecommendations"
                >
                    Generate Recommendations
                </button>


                <div
                    id="p2Recommendations"
                ></div>

            </div>

        `;


        main.appendChild(
            section
        );


        /* =================================
           BUTTON EVENTS
        ================================= */

        $(
            "p2GenerateQuestions"
        )
        .addEventListener(
            "click",
            generateQuestions
        );


        $(
            "p2CheckDraft"
        )
        .addEventListener(
            "click",
            checkDraft
        );


        $(
            "p2SaveDraft"
        )
        .addEventListener(
            "click",
            saveDraft
        );


        $(
            "p2CreateLink"
        )
        .addEventListener(
            "click",
            createTrackedLink
        );


        $(
            "p2LogEvent"
        )
        .addEventListener(
            "click",
            logAttributionEvent
        );


        $(
            "p2GenerateRecommendations"
        )
        .addEventListener(
            "click",
            generateRecommendations
        );


        /* =================================
   QUESTION LOG BUTTONS
================================= */

section.addEventListener(
    "click",
    function(event) {

        const target =
            event.target;


        if (
            !target ||
            !target.dataset
        ) {

            return;
        }


        /* -------------------------
           LOG AI CHECK
        ------------------------- */

        const questionId =
            target.dataset.logCheck;


        if (questionId) {

            logDiscoveryCheck(
                questionId
            );

            return;
        }


        /* -------------------------
           ROUTE CONTENT DRAFT
        ------------------------- */

        const draftId =
            target.dataset.routeDraft;


        if (draftId) {

            routeDraft(
                draftId
            );

            return;
        }


        /* -------------------------
           IMPLEMENT OWNER-APPROVED
           CHANGE
        ------------------------- */

        const approvedDraftId =
            target.dataset.implementApproved;


        if (approvedDraftId) {

            implementApprovedDraft(
                approvedDraftId
            );

            return;
        }
    }
);
}

    /* =====================================
       KEEP PAGE SYNCED WITH SHARED STORE
    ===================================== */

    window.addEventListener(
        "puente:data-changed",
        function () {

            render();
        }
    );


    /* =====================================
       START MODULE
    ===================================== */

    migrateLegacyPerson2();


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            buildPage
        );

    } else {

        buildPage();
    }

})();