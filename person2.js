/* Person 2 module.
   Adds a "Content & Results" tab to the Puente app.

   Reads:
   localStorage "puenteInterview"
   localStorage "puenteAuditItems"

   Writes:
   localStorage "puentePerson2"
*/

(function () {

    const KEY = "puentePerson2";

    const METRICS = [
        ["views", "Platform views"],
        ["clicks", "Clicks"],
        ["visits", "Website visits"],
        ["leads", "Leads"],
        ["sales", "Attributed sales ($)"]
    ];

    const AI_Q = [
        "Best affordable desert hiking gear in El Paso",
        "Where can I buy hiking backpacks in El Paso",
        "Dónde comprar equipo para senderismo en El Paso"
    ];

    const RISKY = [
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

    const DEMO = {
        views: [120, 310],
        clicks: [18, 52],
        visits: [40, 95],
        leads: [2, 7],
        sales: [180, 540]
    };


    /* -----------------------------
       HELPERS
    ----------------------------- */

    const $ = function(id) {
        return document.getElementById(id);
    };


    const esc = function(text) {

        return String(text).replace(
            /[&<>"']/g,
            function(character) {

                const replacements = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"
                };

                return replacements[character];
            }
        );
    };


    const read = function(key, fallback) {

        try {

            return (
                JSON.parse(
                    localStorage.getItem(key)
                ) || fallback
            );

        } catch (error) {

            return fallback;
        }
    };


    const options = function(list, selected) {

        return list
            .map(function(option) {

                return `
                    <option
                        ${option === selected ? "selected" : ""}
                    >
                        ${option}
                    </option>
                `;

            })
            .join("");
    };


    let data = read(
        KEY,
        {
            metrics: {},
            ai: {},
            check: null
        }
    );


    function save() {

        try {

            localStorage.setItem(
                KEY,
                JSON.stringify(data)
            );

        } catch (error) {

            console.error(
                "Could not save Person 2 data.",
                error
            );
        }
    }


    function createList(title, items, emptyMessage) {

        let html = `<h3>${title}</h3>`;

        if (items.length > 0) {

            items.forEach(function(item) {

                html += `
                    <div class="p2-item">
                        ${esc(item)}
                    </div>
                `;
            });

        } else {

            html += `
                <p class="empty-message">
                    ${emptyMessage}
                </p>
            `;
        }

        return html;
    }



    /* -----------------------------
       BUILD PAGE
    ----------------------------- */

    function build() {

        const nav =
            document.querySelector("nav");

        const main =
            document.querySelector("main");


        if (!nav || !main) {

            console.warn(
                "Person 2 module: nav or main not found."
            );

            return;
        }


        /* Prevent duplicates */

        if (document.getElementById("person2")) {
            return;
        }


        /* Styling */

        const style =
            document.createElement("style");

        style.textContent = `

            #person2 .p2-item {
                background: #f3f4f6;
                padding: 10px 12px;
                margin: 8px 0;
                border-left: 4px solid #111827;
            }

            #person2 .p2-flag {
                border-left-color: #b45309;
                background: #fef3e2;
            }

            #person2 h3 {
                margin: 20px 0 4px;
            }

            #person2 td input,
            #person2 td select {
                margin: 0;
            }

            #person2 button.p2-btn {
                margin-top: 16px;
                padding: 11px 18px;
                border: none;
                background: #111827;
                color: white;
                border-radius: 6px;
                cursor: pointer;
            }

        `;

        document.head.appendChild(style);


        /* Navigation button */

        const button =
            document.createElement("button");

        button.textContent =
            "Content & Results";

        button.addEventListener(
            "click",
            function() {

                showPage("person2");
            }
        );

        nav.appendChild(button);


        /* Main page */

        const section =
            document.createElement("section");

        section.id = "person2";

        section.className = "page";


        section.innerHTML = `

            <h2>Content Check and Results</h2>

            <p>
                Review marketing content, track results,
                and determine what Puente should improve next.
            </p>


            <div class="panel">

                <h3 style="margin-top:0">
                    Content Check
                </h3>

                <p class="empty-message">
                    Paste a proposed listing or advertisement.
                    Puente checks it against information collected
                    during the client interview.
                </p>

                <textarea
                    id="p2Draft"
                    aria-label="Draft content"
                >Botas para senderismo en el desierto, solo $95. Las mejores botas, impermeables y con garantía de por vida.</textarea>

                <button
                    class="p2-btn"
                    id="p2Check"
                >
                    Check Content
                </button>

                <div id="p2CheckOut"></div>

            </div>



            <div class="panel">

                <h3 style="margin-top:0">
                    Weekly Metrics
                </h3>

                <p class="empty-message">
                    Compare business performance before and
                    after Puente's implementation.
                </p>

                <table>

                    <thead>

                        <tr>
                            <th>Metric</th>
                            <th>Before</th>
                            <th>After</th>
                        </tr>

                    </thead>

                    <tbody id="p2Metrics"></tbody>

                </table>

                <button
                    class="p2-btn"
                    id="p2Demo"
                >
                    Load Demo Numbers
                </button>

            </div>



            <div class="panel">

                <h3 style="margin-top:0">
                    AI Discovery Check
                </h3>

                <p class="empty-message">
                    Ask an AI assistant each question and record
                    whether it mentions the business.
                </p>

                <table>

                    <thead>

                        <tr>
                            <th>Question</th>
                            <th>Before</th>
                            <th>After</th>
                        </tr>

                    </thead>

                    <tbody id="p2Ai"></tbody>

                </table>

            </div>



            <div class="panel">

                <h3 style="margin-top:0">
                    Recommendations
                </h3>

                <button
                    class="p2-btn"
                    id="p2Reco"
                    style="margin-top:0"
                >
                    Generate Recommendations
                </button>

                <div id="p2RecoOut"></div>

            </div>

        `;


        main.appendChild(section);


        renderMetrics();

        renderAi();


        $("p2Demo").addEventListener(
            "click",
            function() {

                data.metrics =
                    JSON.parse(
                        JSON.stringify(DEMO)
                    );

                save();

                renderMetrics();
            }
        );


        $("p2Check").addEventListener(
            "click",
            checkContent
        );


        $("p2Reco").addEventListener(
            "click",
            recommend
        );
    }



    /* -----------------------------
       WEEKLY METRICS
    ----------------------------- */

    function renderMetrics() {

        const metricsBody =
            $("p2Metrics");


        metricsBody.innerHTML =
            METRICS.map(
                function(metric) {

                    const key =
                        metric[0];

                    const label =
                        metric[1];

                    const values =
                        data.metrics[key] || [];


                    return `

                        <tr>

                            <td>
                                ${label}
                            </td>

                            <td>

                                <input
                                    type="number"
                                    min="0"
                                    aria-label="${label} before"
                                    data-m="${key}"
                                    data-i="0"
                                    value="${values[0] ?? ""}"
                                >

                            </td>

                            <td>

                                <input
                                    type="number"
                                    min="0"
                                    aria-label="${label} after"
                                    data-m="${key}"
                                    data-i="1"
                                    value="${values[1] ?? ""}"
                                >

                            </td>

                        </tr>

                    `;
                }
            )
            .join("");


        metricsBody
            .querySelectorAll("[data-m]")
            .forEach(
                function(input) {

                    input.addEventListener(
                        "change",
                        function() {

                            const key =
                                input.dataset.m;


                            data.metrics[key] =
                                data.metrics[key] ||
                                ["", ""];


                            data.metrics[key][
                                input.dataset.i
                            ] =
                                input.value;


                            save();
                        }
                    );
                }
            );
    }



    /* -----------------------------
       AI DISCOVERY CHECK
    ----------------------------- */

    function renderAi() {

        const choices = [
            "Not checked",
            "Not mentioned",
            "Mentioned"
        ];


        $("p2Ai").innerHTML =
            AI_Q.map(
                function(question, index) {

                    const values =
                        data.ai[index] ||
                        [
                            "Not checked",
                            "Not checked"
                        ];


                    return `

                        <tr>

                            <td>
                                ${question}
                            </td>

                            <td>

                                <select
                                    aria-label="Before: ${question}"
                                    data-a="${index}"
                                    data-i="0"
                                >
                                    ${options(
                                        choices,
                                        values[0]
                                    )}
                                </select>

                            </td>

                            <td>

                                <select
                                    aria-label="After: ${question}"
                                    data-a="${index}"
                                    data-i="1"
                                >
                                    ${options(
                                        choices,
                                        values[1]
                                    )}
                                </select>

                            </td>

                        </tr>

                    `;
                }
            )
            .join("");


        $("p2Ai")
            .querySelectorAll("[data-a]")
            .forEach(
                function(select) {

                    select.addEventListener(
                        "change",
                        function() {

                            const index =
                                select.dataset.a;


                            data.ai[index] =
                                data.ai[index] ||
                                [
                                    "Not checked",
                                    "Not checked"
                                ];


                            data.ai[index][
                                select.dataset.i
                            ] =
                                select.value;


                            save();
                        }
                    );
                }
            );
    }



    /* -----------------------------
       CONTENT CHECK
    ----------------------------- */

    function checkContent() {

        const output =
            $("p2CheckOut");


        const business =
            read(
                "puenteInterview",
                null
            );


        if (!business) {

            output.innerHTML = `

                <div class="p2-item p2-flag">

                    Save the client interview first
                    so there is something to check
                    against.

                </div>

            `;

            return;
        }


        const text =
            $("p2Draft").value;


        const lowerText =
            text.toLowerCase();


        const truth =
            (business.products || "")
                .toLowerCase();


        const pricePattern =
            /\$\s?(\d+(?:\.\d+)?)/g;


        const prices =
            [
                ...(
                    business.products || ""
                ).matchAll(pricePattern)
            ]
            .map(
                function(match) {

                    return Number(
                        match[1]
                    );
                }
            );


        const issues = [];

        const good = [];


        const draftPrices =
            [
                ...text.matchAll(
                    /\$\s?(\d+(?:\.\d+)?)/g
                )
            ];


        draftPrices.forEach(
            function(match) {

                const price =
                    Number(match[1]);


                if (prices.length === 0) {

                    issues.push(
                        `Price $${price} cannot be verified because the client interview lists no prices.`
                    );

                }

                else if (
                    !prices.includes(price)
                ) {

                    issues.push(
                        `Price $${price} does not match any price in the client profile.`
                    );

                }

                else {

                    good.push(
                        `Price $${price} matches the client profile.`
                    );
                }
            }
        );


        RISKY.forEach(
            function(word) {

                if (
                    lowerText.includes(word) &&
                    !truth.includes(word)
                ) {

                    issues.push(
                        `Unverified claim: "${word}" is not in the client profile. Confirm it with the client before publishing.`
                    );
                }
            }
        );


        const terms =
            (
                (business.englishKeywords || "") +
                "," +
                (business.spanishKeywords || "")
            )
            .split(/[,;\n]/)
            .map(function(term) {

                return term.trim();

            })
            .filter(Boolean);


        const missing =
            terms.filter(
                function(term) {

                    return !lowerText.includes(
                        term.toLowerCase()
                    );
                }
            );


        data.check = {

            issues: issues.length,

            missing: missing.length
        };


        save();


        let html = "";


        if (issues.length > 0) {

            issues.forEach(
                function(issue) {

                    html += `

                        <div class="p2-item p2-flag">

                            ${esc(issue)}

                        </div>

                    `;
                }
            );

        } else {

            html += `

                <div class="p2-item">

                    No claim problems found.

                </div>

            `;
        }


        good.forEach(
            function(item) {

                html += `

                    <div class="p2-item">

                        ${esc(item)}

                    </div>

                `;
            }
        );


        if (missing.length > 0) {

            html += `

                <p class="empty-message">

                    Keywords not used yet:
                    ${esc(
                        missing.join(", ")
                    )}

                </p>

            `;

        } else {

            html += `

                <p class="empty-message">

                    All target keywords are used.

                </p>

            `;
        }


        output.innerHTML =
            html;
    }



    /* -----------------------------
       RECOMMENDATIONS
    ----------------------------- */

    function recommend() {

        const worked = [];

        const didNotWork = [];

        const next = [];


        const auditItems =
            read(
                "puenteAuditItems",
                []
            );


        METRICS.forEach(
            function(metric) {

                const key =
                    metric[0];

                const label =
                    metric[1];

                const values =
                    data.metrics[key];


                if (
                    !values ||
                    values[0] === "" ||
                    values[1] === "" ||
                    values[0] === undefined ||
                    values[1] === undefined
                ) {

                    return;
                }


                const before =
                    Number(values[0]);

                const after =
                    Number(values[1]);


                let percentage = "";


                if (before > 0) {

                    const change =
                        Math.round(
                            (
                                (after - before) /
                                before
                            ) * 100
                        );


                    percentage =
                        ` (${change >= 0 ? "+" : ""}${change}%)`;
                }


                const message =
                    `${label}: ${before} to ${after}${percentage}`;


                if (after > before) {

                    worked.push(
                        message
                    );

                } else {

                    didNotWork.push(
                        message
                    );
                }
            }
        );


        function countMentions(index) {

            return Object
                .values(data.ai)
                .filter(
                    function(result) {

                        return (
                            result[index] ===
                            "Mentioned"
                        );
                    }
                )
                .length;
        }


        const beforeMentions =
            countMentions(0);

        const afterMentions =
            countMentions(1);


        if (
            Object.keys(data.ai).length
        ) {

            const message =
                `AI discovery: mentioned in ${beforeMentions} of ${AI_Q.length} questions before and ${afterMentions} after.`;


            if (
                afterMentions >
                beforeMentions
            ) {

                worked.push(
                    message
                );

            } else {

                didNotWork.push(
                    message
                );
            }
        }


        if (
            data.check &&
            data.check.issues
        ) {

            next.push(
                `Fix the ${data.check.issues} claim problem(s) found in the content check before publishing.`
            );
        }


        if (
            data.check &&
            data.check.missing
        ) {

            next.push(
                "Add the missing English and Spanish keywords to the descriptions."
            );
        }


        auditItems
            .filter(
                function(item) {

                    return (
                        item.actionStatus ===
                        "Needs Approval"
                    );
                }
            )
            .forEach(
                function(item) {

                    next.push(
                        `Review and approve: ${item.action} (${item.platform}).`
                    );
                }
            );


        auditItems
            .filter(
                function(item) {

                    return (
                        item.priority === "High" &&
                        ![
                            "Completed",
                            "Published",
                            "Needs Approval"
                        ].includes(
                            item.actionStatus
                        )
                    );
                }
            )
            .forEach(
                function(item) {

                    next.push(
                        `Finish high-priority action: ${item.action} (${item.platform}, ${item.actionStatus}).`
                    );
                }
            );


        if (
            didNotWork.some(
                function(item) {

                    return item.startsWith(
                        "AI"
                    );
                }
            )
        ) {

            next.push(
                "Publish consistent business and product details across active platforms so AI assistants have stronger public information to reference."
            );
        }


        $("p2RecoOut").innerHTML =

            createList(
                "What Worked",
                worked,
                "Enter before and after numbers to see results."
            )

            +

            createList(
                "What Did Not",
                didNotWork,
                "Nothing is flat or down yet."
            )

            +

            createList(
                "What Puente Recommends Next",
                next,
                "No open items. Continue tracking performance."
            );
    }



    /* -----------------------------
       START MODULE
    ----------------------------- */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            build
        );

    } else {

        build();
    }

})();