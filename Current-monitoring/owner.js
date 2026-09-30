/* =============================
   PUENTE BUSINESS OWNER PORTAL
============================= */


function readSavedData(
    key,
    fallback
) {

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



/* =============================
   LOAD DATA
============================= */

function loadOwnerPortal() {

    const data =
        PuenteStore.get();


    const profile =
        data.profile ||
        {};


    const audits =
        data.auditItems ||
        [];


    const intelligence =
        data.intelligence ||
        {
            questions: [],
            checks: [],
            attr: [],
            links: [],
            recos: [],
            drafts: []
        };


    const approvals =
        data.approvals ||
        [];


    loadBusinessName(
        profile
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
        approvals
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


    const results =
        readSavedData(
            "puentePerson2",
            {
                metrics: {},
                ai: {},
                check: null
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
        audits
    );


    loadResults(
        results
    );


    loadNextStep(
        audits
    );




/* =============================
   BUSINESS NAME
============================= */

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



/* =============================
   PRESENCE SCORE
============================= */

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


            totalScore +=
                score;
        }
    );


    let finalScore = 0;


    if (
        audits.length > 0
    ) {

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



/* =============================
   COMPLETED ACTIONS
============================= */

function loadCompletedActions(
    audits
) {

    const completed =
        audits.filter(
            function(item) {

                return (
                    item.actionStatus ===
                    "Completed"
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



/* =============================
   CURRENT WORK
============================= */

function loadActions(
    audits
) {

    const container =
        document.getElementById(
            "ownerActionList"
        );


    container.innerHTML =
        "";


    if (
        audits.length === 0
    ) {

        container.innerHTML =
            `
            <div class="owner-action">

                <div>
                    <h3>
                        No actions yet
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
                "Completed"
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


            wrapper.innerHTML =
                `
                <div>

                    <h3>
                        ${item.action}
                    </h3>

                    <p>
                        ${item.platform}
                        •
                        ${item.priority}
                        priority
                    </p>

                </div>


                <span
                    class="${statusClass}"
                >
                    ${item.actionStatus}
                </span>
                `;


            container.appendChild(
                wrapper
            );
        }
    );
}



/* =============================
   APPROVALS
============================= */

function loadApprovals(
    approvals
) {

    const container =
        document.getElementById(
            "ownerApprovalList"
        );


    if (!container) {

        return;
    }


    container.innerHTML =
        "";


    const pending =
        approvals.filter(
            function(approval) {

                return (
                    approval.status ===
                    "Pending Owner"
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
                    No material changes are
                    waiting for your review.
                </p>

            </div>

        `;


        return;
    }


    pending.forEach(
        function(approval) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "approval-card";


            const reasons =
                Array.isArray(
                    approval.reasons
                )
                    ? approval.reasons
                    : [];


            card.innerHTML = `

                <p class="eyebrow">
                    ${escapeHtml(
                        approval.platform ||
                        "Puente"
                    )}
                </p>


                <h3>
                    ${escapeHtml(
                        approval.changeType ||
                        "Material Change"
                    )}
                </h3>


                <p>
                    Puente classified this as a
                    material change that requires
                    your approval before implementation.
                </p>


                <div class="content-preview">

                    ${escapeHtml(
                        approval.text
                    )}

                </div>


                ${
                    reasons.length > 0

                        ? `

                            <div
                                class="approval-reasons"
                            >

                                <strong>
                                    Why review is required
                                </strong>

                                ${reasons
                                    .map(
                                        function(reason) {

                                            return `

                                                <p>
                                                    •
                                                    ${escapeHtml(
                                                        reason
                                                    )}
                                                </p>

                                            `;
                                        }
                                    )
                                    .join("")}

                            </div>

                        `

                        : ""
                }


                <label>
                    Optional note to Puente
                </label>


                <textarea
                    id="ownerNote-${approval.id}"
                    placeholder="Add feedback for the Puente team..."
                ></textarea>


                <div class="approval-buttons">


                    <button
                        class="approve-button"
                        onclick="
                            ownerDecision(
                                '${approval.id}',
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
                                '${approval.id}',
                                'Changes Requested'
                            )
                        "
                    >
                        Request Changes
                    </button>


                    <button
                        class="change-button"
                        onclick="
                            ownerDecision(
                                '${approval.id}',
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
    approvalId,
    decision
) {

    const noteElement =
        document.getElementById(
            "ownerNote-" +
            approvalId
        );


    const ownerNote =
        noteElement
            ? noteElement.value.trim()
            : "";


    PuenteStore.update(
        function(data) {

            const approval =
            
                data.approvals.find(
                    function(item) {

                        return (
                            item.id ===
                            approvalId
                        );
                    }
                );


            if (!approval) {

                return;
            }
/*
   Prevent the same approval
   from being decided twice.
*/

if (
    approval.status !==
    "Pending Owner"
) {

    return;
}

            const draft =
                data.intelligence
                    .drafts
                    .find(
                        function(item) {

                            return (
                                item.id ===
                                approval.draftId
                            );
                        }
                    );


            const timestamp =
                new Date()
                    .toISOString();


            /* -------------------------
               UPDATE APPROVAL
            ------------------------- */

            approval.status =
                decision;


            approval.decision =
                decision;


            approval.ownerNote =
                ownerNote;


            approval.decidedAt =
                timestamp;


            /* -------------------------
               UPDATE DRAFT
            ------------------------- */

            if (draft) {

                draft.ownerNote =
                    ownerNote;


                draft.ownerDecision =
                    decision;


                draft.decidedAt =
                    timestamp;


                if (
                    decision ===
                    "Approved"
                ) {

                    draft.status =
                        "Approved for Implementation";


                    draft.ownerApproved =
                        true;
                }


                else if (
                    decision ===
                    "Changes Requested"
                ) {

                    draft.status =
                        "Changes Requested";


                    draft.ownerApproved =
                        false;
                }


                else if (
                    decision ===
                    "Rejected"
                ) {

                    draft.status =
                        "Rejected";


                    draft.ownerApproved =
                        false;
                }
            }


            /* -------------------------
               AUDIT LOG
            ------------------------- */

            data.auditLog.push({

                id:
                    "audit-" +
                    Date.now(),

                type:
                    "Owner Decision",

                approvalId:
                    approval.id,

                draftId:
                    approval.draftId,

                platform:
                    approval.platform,

                changeType:
                    approval.changeType,

                action:
                    "Owner decision recorded",

                decision:
                    decision,

                ownerNote:
                    ownerNote,

                status:
                    decision,

                timestamp:
                    timestamp
            });
        }
    );


    loadOwnerPortal();
}


/* =============================
   OWNER APPROVAL
============================= */

function approveAction(
    index
) {

    const audits =
        readSavedData(
            "puenteAuditItems",
            []
        );


    if (
        !audits[index]
    ) {

        return;
    }


    audits[index].actionStatus =
        "Published";


    localStorage.setItem(
        "puenteAuditItems",
        JSON.stringify(
            audits
        )
    );


    alert(
        "Approved. Puente can now move forward with this action."
    );


    loadOwnerPortal();
}



/* =============================
   REQUEST CHANGES
============================= */

function requestChanges(
    index
) {

    const audits =
        readSavedData(
            "puenteAuditItems",
            []
        );


    if (
        !audits[index]
    ) {

        return;
    }


    audits[index].actionStatus =
        "In Progress";


    localStorage.setItem(
        "puenteAuditItems",
        JSON.stringify(
            audits
        )
    );


    alert(
        "Your request has been sent back to the Puente team for revision."
    );


    loadOwnerPortal();
}



/* =============================
   RESULTS
============================= */

function loadResults(
    results
) {

    const metrics =
        results.metrics ||
        {};


    const definitions = [

    [
        "views",
        "Platform Views"
    ],

    [
        "clicks",
        "Attributed Clicks"
    ],

    [
        "visits",
        "Website Visits"
    ],

    [
        "leads",
        "Leads"
    ]

];


    const tableBody =
        document.getElementById(
            "ownerResultsBody"
        );


    tableBody.innerHTML =
        "";


    definitions.forEach(
        function(definition) {

            const key =
                definition[0];

            const label =
                definition[1];

            const values =
                metrics[key];


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
                Number(
                    values[0]
                );

            const after =
                Number(
                    values[1]
                );


            let change =
                "—";


            if (
                before > 0
            ) {

                const percentage =
                    Math.round(
                        (
                            (
                                after -
                                before
                            ) /
                            before
                        ) *
                        100
                    );


                change =
                    (
                        percentage > 0
                            ? "+"
                            : ""
                    ) +
                    percentage +
                    "%";
            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML =
                `
                <td>
                    ${label}
                </td>

                <td>
                    ${before}
                </td>

                <td>
             
                    ${after}
                </td>

                <td
                    class="${
                        after > before
                            ? "positive-change"
                            : ""
                    }"
                >
                    ${change}
                </td>
                `;


            tableBody.appendChild(
                row
            );
        }
    );


    loadHeadlineMetrics(
        metrics
    );
}



/* =============================
   HEADLINE METRICS
============================= */

fconst clicks =
    metrics.clicks;


if (
    clicks &&
    clicks[1] !== undefined &&
    clicks[1] !== ""
) {

    document.getElementById(
        "ownerClicks"
    ).textContent =
        Number(
            clicks[1]
        ).toLocaleString();


    document.getElementById(
        "ownerClicksChange"
    ).textContent =
        buildChangeText(
            clicks
        );
}


    const sales =
        metrics.sales;


    if (
        sales &&
        sales[1] !== undefined &&
        sales[1] !== ""
    ) {

        document.getElementById(
            "ownerSales"
        ).textContent =
            "$" +
            Number(
                sales[1]
            ).toLocaleString();


        document.getElementById(
            "ownerSalesChange"
        ).textContent =
            buildChangeText(
                sales
            );
    }




/* =============================
   CHANGE TEXT
============================= */

function buildChangeText(
    values
) {

    const before =
        Number(values[0]);

    const after =
        Number(values[1]);


    if (
        before <= 0
    ) {

        return (
            "Current period result"
        );
    }


    const percentage =
        Math.round(
            (
                (
                    after -
                    before
                ) /
                before
            ) *
            100
        );


    return (
        percentage >= 0
            ? "+"
            : ""
    ) +
    percentage +
    "% from baseline";
}



/* =============================
   NEXT STEP
============================= */

function loadNextStep(
    audits
) {

    const highPriority =
        audits.find(
            function(item) {

                return (
                    item.priority ===
                    "High" &&
                    item.actionStatus !==
                    "Completed"
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



/* =============================
   LOGOUT
============================= */

function ownerLogout() {

    localStorage.removeItem(
        "puenteOwnerLoggedIn"
    );


    window.location.href =
        "owner-login.html";
}



/* =============================
   START
============================= */
/* =====================================
   LIVE SHARED-STORE SYNC
===================================== */

window.addEventListener(
    "puente:data-changed",
    function() {

        loadOwnerPortal();
    }
);


window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            PuenteStore.key
        ) {

            loadOwnerPortal();
        }
    }
);

document.addEventListener(
    "DOMContentLoaded",
    loadOwnerPortal
);

