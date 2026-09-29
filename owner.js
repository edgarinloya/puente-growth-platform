/* =====================================
   PUENTE BUSINESS OWNER PORTAL
===================================== */


function readSavedData(key, fallback) {

    try {

        return (
            JSON.parse(
                localStorage.getItem(key)
            ) || fallback
        );

    } catch (error) {

        return fallback;
    }
}



/* =====================================
   LOAD PORTAL
===================================== */

function loadOwnerPortal() {

    const interview =
        readSavedData(
            "puenteInterview",
            {}
        );


    const audits =
        readSavedData(
            "puenteAuditItems",
            []
        );


    const intelligence =
        readSavedData(
            "puentePerson2",
            {
                questions: [],
                checks: [],
                attr: [],
                links: [],
                recos: [],
                drafts: []
            }
        );


    loadBusinessName(
        interview
    );


    loadPresenceScore(
        audits
    );


    loadCompletedActions(
        audits
    );


    loadActions(
        audits
    );


    loadApprovals(
        audits,
        intelligence
    );


    loadAttribution(
        intelligence
    );


    loadAIVisibility(
        intelligence
    );


    loadRecommendations(
        intelligence
    );


    loadNextStep(
        audits,
        intelligence
    );
}



/* =====================================
   BUSINESS NAME
===================================== */

function loadBusinessName(
    interview
) {

    const businessName =
        interview.businessName ||
        "Your Business";


    document.getElementById(
        "ownerBusinessName"
    ).textContent =
        businessName;


    document.getElementById(
        "navBusinessName"
    ).textContent =
        businessName;
}



/* =====================================
   DIGITAL PRESENCE SCORE
===================================== */

function loadPresenceScore(
    audits
) {

    let totalScore = 0;


    audits.forEach(
        function(item) {

            let score = 0;


            if (
                item.status ===
                "Active"
            ) {

                score += 40;
            }

            else if (
                item.status ===
                "Limited"
            ) {

                score += 20;
            }


            if (
                item.quality ===
                "Good"
            ) {

                score += 60;
            }

            else if (
                item.quality ===
                "Fair"
            ) {

                score += 40;
            }

            else if (
                item.quality ===
                "Poor"
            ) {

                score += 20;
            }


            totalScore += score;
        }
    );


    let finalScore = 0;


    if (audits.length > 0) {

        finalScore =
            Math.round(
                totalScore /
                audits.length
            );
    }


    document.getElementById(
        "ownerPresenceScore"
    ).textContent =
        finalScore +
        " / 100";
}



/* =====================================
   ACTIONS COMPLETED
===================================== */

function loadCompletedActions(
    audits
) {

    const completed =
        audits.filter(
            function(item) {

                return (
                    item.actionStatus ===
                    "Completed" ||
                    item.actionStatus ===
                    "Published"
                );
            }
        ).length;


    document.getElementById(
        "ownerActionsCompleted"
    ).textContent =
        completed +
        " / " +
        audits.length;
}



/* =====================================
   CURRENT WORK
===================================== */

function loadActions(
    audits
) {

    const container =
        document.getElementById(
            "ownerActionList"
        );


    container.innerHTML = "";


    if (
        audits.length === 0
    ) {

        container.innerHTML = `

            <div class="owner-action">

                <div>

                    <h3>
                        No growth actions yet
                    </h3>

                    <p>
                        Your Puente growth plan
                        will appear here.
                    </p>

                </div>

            </div>

        `;

        return;
    }


    audits.forEach(
        function(item) {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "owner-action";


            let statusClass =
                "status-pill";


            if (
                item.actionStatus ===
                    "Completed" ||
                item.actionStatus ===
                    "Published"
            ) {

                statusClass +=
                    " status-completed";
            }


            if (
                item.actionStatus ===
                "Needs Approval"
            ) {

                statusClass +=
                    " status-approval";
            }


            wrapper.innerHTML = `

                <div>

                    <h3>
                        ${escapeHtml(
                            item.action
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            item.platform
                        )}
                        •
                        ${escapeHtml(
                            item.priority
                        )}
                        priority
                    </p>

                </div>


                <span
                    class="${statusClass}"
                >

                    ${escapeHtml(
                        item.actionStatus
                    )}

                </span>

            `;


            container.appendChild(
                wrapper
            );
        }
    );
}



/* =====================================
   CONTENT APPROVALS
===================================== */

function loadApprovals(
    audits,
    intelligence
) {

    const container =
        document.getElementById(
            "ownerApprovalList"
        );


    container.innerHTML = "";


    const drafts =
        intelligence.drafts || [];


    const pending =
        drafts.filter(
            function(draft) {

                return (
                    draft.status ===
                    "Pending owner"
                );
            }
        );


    if (
        pending.length === 0
    ) {

        container.innerHTML = `

            <div class="approval-card">

                <h3>
                    You're all caught up.
                </h3>

                <p>
                    No Puente content is
                    waiting for your approval.
                </p>

            </div>

        `;

        return;
    }


    pending.forEach(
        function(draft) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "approval-card";


            card.innerHTML = `

                <p class="eyebrow">
                    ${escapeHtml(
                        draft.platform
                    )}
                </p>

                <h3>
                    Content ready for review
                </h3>


                <div class="content-preview">

                    ${escapeHtml(
                        draft.text
                    )}

                </div>


                <label>
                    Optional note to Puente
                </label>

                <textarea
                    id="ownerNote-${draft.id}"
                    placeholder="Add feedback..."
                ></textarea>


                <div class="approval-buttons">

                    <button
                        class="approve-button"
                        onclick="
                            ownerDecision(
                                '${draft.id}',
                                'Approved'
                            )
                        "
                    >
                        Approve
                    </button>


                    <button
                        class="change-button"
                        onclick="
                            ownerDecision(
                                '${draft.id}',
                                'Changes requested'
                            )
                        "
                    >
                        Request Changes
                    </button>


                    <button
                        class="change-button"
                        onclick="
                            ownerDecision(
                                '${draft.id}',
                                'Rejected'
                            )
                        "
                    >
                        Reject
                    </button>

                </div>

            `;


            container.appendChild(
                card
            );
        }
    );
}



/* =====================================
   OWNER DECISION
===================================== */

function ownerDecision(
    draftId,
    decision
) {

    const intelligence =
        readSavedData(
            "puentePerson2",
            {}
        );


    const audits =
        readSavedData(
            "puenteAuditItems",
            []
        );


    intelligence.drafts =
        intelligence.drafts || [];


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


    const noteElement =
        document.getElementById(
            "ownerNote-" +
            draftId
        );


    draft.ownerNote =
        noteElement
            ? noteElement.value
            : "";


    draft.status =
        decision;


    draft.decidedAt =
        new Date()
            .toISOString()
            .slice(0,10);


    if (
        draft.actionIdx !== "" &&
        audits[
            Number(
                draft.actionIdx
            )
        ]
    ) {

        let newStatus =
            "Not Started";


        if (
            decision ===
            "Approved"
        ) {

            newStatus =
                "Published";
        }


        else if (
            decision ===
            "Changes requested"
        ) {

            newStatus =
                "In Progress";
        }


        audits[
            Number(
                draft.actionIdx
            )
        ].actionStatus =
            newStatus;
    }


    localStorage.setItem(
        "puentePerson2",
        JSON.stringify(
            intelligence
        )
    );


    localStorage.setItem(
        "puenteAuditItems",
        JSON.stringify(
            audits
        )
    );


    loadOwnerPortal();
}



/* =====================================
   ATTRIBUTION RESULTS
===================================== */

function loadAttribution(
    intelligence
) {

    const events =
        intelligence.attr ||
        [];


    const totalsBySource = {};


    events.forEach(
        function(event) {

            if (
                !totalsBySource[
                    event.source
                ]
            ) {

                totalsBySource[
                    event.source
                ] = {

                    visits: 0,
                    leads: 0,
                    sales: 0
                };
            }


            const source =
                totalsBySource[
                    event.source
                ];


            if (
                event.event ===
                "Visit"
            ) {

                source.visits += 1;
            }


            if (
                event.event ===
                "Lead"
            ) {

                source.leads += 1;
            }


            if (
                event.event ===
                "Sale"
            ) {

                source.sales +=
                    Number(
                        event.value || 0
                    );
            }
        }
    );


    const body =
        document.getElementById(
            "ownerResultsBody"
        );


    body.innerHTML = "";


    Object.entries(
        totalsBySource
    ).forEach(
        function(entry) {

            const sourceName =
                entry[0];

            const totals =
                entry[1];


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        sourceName
                    )}
                </td>

                <td>
                    ${totals.visits}
                </td>

                <td>
                    ${totals.leads}
                </td>

                <td>
                    $${totals.sales.toLocaleString()}
                </td>

            `;


            body.appendChild(
                row
            );
        }
    );


    if (
        Object.keys(
            totalsBySource
        ).length === 0
    ) {

        body.innerHTML = `

            <tr>

                <td colspan="4">
                    No attributable results
                    have been recorded yet.
                </td>

            </tr>

        `;
    }


    const totalLeads =
        events.filter(
            function(event) {

                return (
                    event.event ===
                    "Lead"
                );
            }
        ).length;


    const totalSales =
        events
            .filter(
                function(event) {

                    return (
                        event.event ===
                        "Sale"
                    );
                }
            )
            .reduce(
                function(total, event) {

                    return (
                        total +
                        Number(
                            event.value || 0
                        )
                    );
                },
                0
            );


    document.getElementById(
        "ownerLeads"
    ).textContent =
        totalLeads;


    document.getElementById(
        "ownerLeadsChange"
    ).textContent =
        "Attributed through Puente";


    document.getElementById(
        "ownerSales"
    ).textContent =
        "$" +
        totalSales.toLocaleString();


    document.getElementById(
        "ownerSalesChange"
    ).textContent =
        "Attributed through Puente";
}



/* =====================================
   AI VISIBILITY
===================================== */

function loadAIVisibility(
    intelligence
) {

    const checks =
        intelligence.checks ||
        [];


    if (
        checks.length === 0
    ) {

        document.getElementById(
            "ownerAIVisibility"
        ).textContent =
            "—";


        document.getElementById(
            "ownerAIAccuracy"
        ).textContent =
            "No discovery checks yet";


        return;
    }


    const groups = {};


    checks.forEach(
        function(check) {

            const key =
                check.qid +
                "|" +
                check.assistant;


            if (
                !groups[key]
            ) {

                groups[key] =
                    [];
            }


            groups[key].push(
                check
            );
        }
    );


    const latestChecks =
        Object.values(
            groups
        ).map(
            function(group) {

                return group[
                    group.length - 1
                ];
            }
        );


    const mentioned =
        latestChecks.filter(
            function(check) {

                return (
                    check.result !==
                    "Not mentioned"
                );
            }
        );


    const visibility =
        Math.round(
            (
                mentioned.length /
                latestChecks.length
            ) *
            100
        );


    let accuracy = 0;


    if (
        mentioned.length > 0
    ) {

        accuracy =
            Math.round(
                (
                    mentioned.filter(
                        function(check) {

                            return (
                                check.result ===
                                "Mentioned - accurate"
                            );
                        }
                    ).length /
                    mentioned.length
                ) *
                100
            );
    }


    document.getElementById(
        "ownerAIVisibility"
    ).textContent =
        visibility +
        "%";


    document.getElementById(
        "ownerAIAccuracy"
    ).textContent =
        accuracy +
        "% mention accuracy";
}



/* =====================================
   RECOMMENDATIONS
===================================== */

function loadRecommendations(
    intelligence
) {

    const container =
        document.getElementById(
            "ownerRecommendations"
        );


    container.innerHTML = "";


    const recommendations =
        (
            intelligence.recos ||
            []
        )
        .filter(
            function(item) {

                return (
                    item.status !==
                    "Dismissed"
                );
            }
        )
        .slice(-5)
        .reverse();


    if (
        recommendations.length === 0
    ) {

        container.innerHTML = `

            <div class="owner-action">

                <div>

                    <h3>
                        No recommendations yet
                    </h3>

                    <p>
                        Puente recommendations
                        will appear after enough
                        activity has been measured.
                    </p>

                </div>

            </div>

        `;

        return;
    }


    recommendations.forEach(
        function(recommendation) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "owner-action";


            let label =
                "Next Step";


            if (
                recommendation.type ===
                "worked"
            ) {

                label =
                    "What's Working";
            }


            else if (
                recommendation.type ===
                "not"
            ) {

                label =
                    "Needs Attention";
            }


            item.innerHTML = `

                <div>

                    <p class="eyebrow">

                        ${label}

                    </p>

                    <h3>

                        ${escapeHtml(
                            recommendation.text
                        )}

                    </h3>

                </div>


                <span class="status-pill">

                    ${escapeHtml(
                        recommendation.status
                    )}

                </span>

            `;


            container.appendChild(
                item
            );
        }
    );
}



/* =====================================
   NEXT STEP
===================================== */

function loadNextStep(
    audits,
    intelligence
) {

    const recommendations =
        intelligence.recos ||
        [];


    const nextRecommendation =
        recommendations
            .slice()
            .reverse()
            .find(
                function(item) {

                    return (
                        item.type ===
                            "next" &&
                        item.status !==
                            "Done" &&
                        item.status !==
                            "Dismissed"
                    );
                }
            );


    if (
        nextRecommendation
    ) {

        document.getElementById(
            "ownerNextStep"
        ).textContent =
            nextRecommendation.text;

        return;
    }


    const highPriority =
        audits.find(
            function(item) {

                return (
                    item.priority ===
                        "High" &&
                    ![
                        "Completed",
                        "Published"
                    ].includes(
                        item.actionStatus
                    )
                );
            }
        );


    if (
        highPriority
    ) {

        document.getElementById(
            "ownerNextStep"
        ).textContent =
            "Our current focus is " +
            highPriority.action +
            " on " +
            highPriority.platform +
            ".";
    }
}



/* =====================================
   SAFE HTML
===================================== */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        function(character) {

            const replacements = {

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#39;"
            };


            return (
                replacements[
                    character
                ]
            );
        }
    );
}



/* =====================================
   LOG OUT
===================================== */

function ownerLogout() {

    localStorage.removeItem(
        "puenteOwnerLoggedIn"
    );


    window.location.href =
        "owner-login.html";
}



/* =====================================
   START
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    loadOwnerPortal
);