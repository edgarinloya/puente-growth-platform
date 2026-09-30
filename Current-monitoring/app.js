let auditItems = [];
let editingAuditIndex = null;
/* -----------------------------
   PAGE NAVIGATION
----------------------------- */

function showPage(pageId) {

    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(
        function(page) {

            page.classList.remove(
                "active"
            );
        }
    );


    const targetPage =
        document.getElementById(
            pageId
        );


    if (!targetPage) {

        console.warn(
            "Puente page not found:",
            pageId
        );

        return;
    }


    targetPage.classList.add(
        "active"
    );


    /* NAVIGATION ACTIVE STATE */

    const navButtons =
        document.querySelectorAll(
            "nav button[data-page]"
        );


    navButtons.forEach(
        function(button) {

            button.classList.remove(
                "active-nav"
            );
        }
    );


    const activeButton =
        document.querySelector(
            `nav button[data-page="${pageId}"]`
        );


    if (activeButton) {

        activeButton.classList.add(
            "active-nav"
        );
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* -----------------------------
   CLIENT INTERVIEW
----------------------------- */

function saveInterview() {

    const interviewData = {

        businessName:
            document.getElementById("businessName").value,

        ownerName:
            document.getElementById("ownerName").value,

        industry:
            document.getElementById("industry").value,

        location:
            document.getElementById("location").value,

        products:
            document.getElementById("products").value,

        customers:
            document.getElementById("customers").value,

        advantages:
            document.getElementById("advantages").value,

        challenges:
            document.getElementById("challenges").value,

        englishKeywords:
            document.getElementById("englishKeywords").value,

        spanishKeywords:
            document.getElementById("spanishKeywords").value
    };


   PuenteStore.update(function(data) {

    data.profile = {
        ...data.profile,
        ...interviewData
    };

});


    updateBusinessProfile(interviewData);
    updateGrowthBrief();

    alert("Client interview saved.");

    showPage("profile");
}


/* -----------------------------
   BUSINESS PROFILE
----------------------------- */

function updateBusinessProfile(data) {

    document.getElementById(
    "dashboardBusinessName"
).textContent =
    data.businessName || "Business Name";

    document.getElementById(
        "profileBusinessName"
    ).textContent =
        data.businessName || "Business Name";


    document.getElementById(
        "profileIndustry"
    ).textContent =
        data.industry || "Not provided";


    document.getElementById(
        "profileLocation"
    ).textContent =
        data.location || "Not provided";


    document.getElementById(
        "profileCustomers"
    ).textContent =
        data.customers || "Not provided";


    document.getElementById(
        "profileAdvantages"
    ).textContent =
        data.advantages || "Not provided";


    document.getElementById(
        "profileChallenges"
    ).textContent =
        data.challenges || "Not provided";
}

/* -----------------------------
   DIGITAL AUDIT
----------------------------- */

function addAuditItem() {

    const platform =
        document.getElementById("auditPlatform").value;

    const status =
        document.getElementById("auditStatus").value;

    const quality =
        document.getElementById("auditQuality").value;

    const action =
        document.getElementById("auditAction").value;

    const priority =
        document.getElementById("auditPriority").value;


    if (platform === "" || action === "") {

        alert(
            "Please enter a platform and recommended action."
        );

        return;
    }


    const auditItem = {

        platform: platform,

        status: status,

        quality: quality,

        action: action,

        priority: priority,

        actionStatus: "Not Started"
    };


  if (editingAuditIndex === null) {

    auditItems.push(auditItem);

} else {

    auditItem.actionStatus =
        auditItems[editingAuditIndex].actionStatus;

    auditItems[editingAuditIndex] =
        auditItem;

    editingAuditIndex = null;

    document.getElementById(
        "auditSubmitButton"
    ).textContent =
        "Add Audit Item";
}


    saveAuditItems();

    renderAuditTable();

    renderActionPlan();

    updateDashboard();

    updateGrowthBrief();

    document.getElementById(
        "auditPlatform"
    ).value = "";

    document.getElementById(
        "auditAction"
    ).value = "";
}


/* -----------------------------
   SAVE AUDIT DATA
----------------------------- */

function saveAuditItems() {

    PuenteStore.update(function(data) {

        data.auditItems =
            auditItems;

    });
}


/* -----------------------------
   RENDER AUDIT TABLE
----------------------------- */

function renderAuditTable() {

    const tableBody =
        document.getElementById("auditTableBody");

    tableBody.innerHTML = "";


    auditItems.forEach(function(item, index) {

        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>${item.platform}</td>

            <td>${item.status}</td>

            <td>${item.quality}</td>

            <td>${item.action}</td>

            <td>${item.priority}</td>

            <td>
                <button
                    onclick="editAuditItem(${index})"
                >
                    Edit
                </button>
            </td>
        `;


        tableBody.appendChild(row);
    });
}

/* -----------------------------
   RENDER ACTION PLAN
----------------------------- */

function renderActionPlan() {

    const tableBody =
        document.getElementById("actionTableBody");

    tableBody.innerHTML = "";


    auditItems.forEach(function(item, index) {

        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>${item.action}</td>

            <td>${item.platform}</td>

            <td>${item.priority}</td>

            <td>
                <select
                    onchange="updateActionStatus(
                        ${index},
                        this.value
                    )"
                >

                    <option
                        value="Not Started"
                        ${item.actionStatus === "Not Started"
                            ? "selected"
                            : ""}
                    >
                        Not Started
                    </option>

                    <option
                        value="In Progress"
                        ${item.actionStatus === "In Progress"
                            ? "selected"
                            : ""}
                    >
                        In Progress
                    </option>

                    <option
                        value="Needs Approval"
                        ${item.actionStatus === "Needs Approval"
                            ? "selected"
                            : ""}
                    >
                        Needs Approval
                    </option>

                    <option
                        value="Published"
                        ${item.actionStatus === "Published"
                            ? "selected"
                            : ""}
                    >
                        Published
                    </option>

                    <option
                        value="Completed"
                        ${item.actionStatus === "Completed"
                            ? "selected"
                            : ""}
                    >
                        Completed
                    </option>

                </select>
            </td>
        `;


        tableBody.appendChild(row);
    });
}


/* -----------------------------
   UPDATE ACTION STATUS
----------------------------- */

function updateActionStatus(index, newStatus) {

    auditItems[index].actionStatus =
        newStatus;

    saveAuditItems();

    updateDashboard();
    updateGrowthBrief();
}


/* -----------------------------
   UPDATE DASHBOARD
----------------------------- */

function updateDashboard() {

    /* -------------------------
       HIGH PRIORITY ACTIONS
    ------------------------- */

    const highPriority =
        auditItems.filter(function(item) {

            return (
                item.priority === "High" &&
                item.actionStatus !== "Completed"
            );

        }).length;


    /* -------------------------
       COMPLETED ACTIONS
    ------------------------- */

    const completed =
        auditItems.filter(function(item) {

            return (
                item.actionStatus === "Completed"
            );

        }).length;


    /* -------------------------
       ACTIVE PLATFORMS
    ------------------------- */

    const activePlatforms =
        auditItems.filter(function(item) {

            return item.status === "Active";

        }).length;


    /* -------------------------
       DIGITAL PRESENCE SCORE
    ------------------------- */

    let totalScore = 0;


    auditItems.forEach(function(item) {

        let platformScore = 0;


        /* STATUS SCORE */

        if (item.status === "Active") {
            platformScore += 40;
        }

        else if (item.status === "Limited") {
            platformScore += 20;
        }


        /* PROFILE QUALITY SCORE */

        if (item.quality === "Good") {
            platformScore += 60;
        }

        else if (item.quality === "Fair") {
            platformScore += 40;
        }

        else if (item.quality === "Poor") {
            platformScore += 20;
        }


        totalScore += platformScore;

    });


    let digitalPresenceScore = 0;


    if (auditItems.length > 0) {

        digitalPresenceScore =
            Math.round(
                totalScore / auditItems.length
            );

    }


    /* -------------------------
       UPDATE DASHBOARD
    ------------------------- */

    document.getElementById(
        "highPriorityCount"
    ).textContent = highPriority;


    document.getElementById(
        "completedActionCount"
    ).textContent = completed;


    document.getElementById(
        "activePlatformCount"
    ).textContent = activePlatforms;


    document.getElementById(
        "digitalPresenceScore"
    ).textContent =
        digitalPresenceScore + " / 100";
}

/* -----------------------------
   LOAD SAVED DATA
----------------------------- */

function loadPuenteData() {

    const puenteData =
        PuenteStore.get();

    const interviewData =
        puenteData.profile || {};


    /* -------------------------
       LOAD INTERVIEW
    ------------------------- */

    document.getElementById(
        "businessName"
    ).value =
        interviewData.businessName || "";

    document.getElementById(
        "ownerName"
    ).value =
        interviewData.ownerName || "";

    document.getElementById(
        "industry"
    ).value =
        interviewData.industry || "";

    document.getElementById(
        "location"
    ).value =
        interviewData.location || "";

    document.getElementById(
        "products"
    ).value =
        interviewData.products || "";

    document.getElementById(
        "customers"
    ).value =
        interviewData.customers || "";

    document.getElementById(
        "advantages"
    ).value =
        interviewData.advantages || "";

    document.getElementById(
        "challenges"
    ).value =
        interviewData.challenges || "";

    document.getElementById(
        "englishKeywords"
    ).value =
        interviewData.englishKeywords || "";

    document.getElementById(
        "spanishKeywords"
    ).value =
        interviewData.spanishKeywords || "";


    updateBusinessProfile(
        interviewData
    );


    /* -------------------------
       LOAD DIGITAL AUDIT
    ------------------------- */

    auditItems =
        puenteData.auditItems || [];


    renderAuditTable();

renderActionPlan();

updateDashboard();

updateGrowthBrief();

renderApprovedFacts();
}


/* -----------------------------
   START APPLICATION
----------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    loadPuenteData
);

function editAuditItem(index) {

    const item =
        auditItems[index];


    document.getElementById(
        "auditPlatform"
    ).value =
        item.platform;


    document.getElementById(
        "auditStatus"
    ).value =
        item.status;


    document.getElementById(
        "auditQuality"
    ).value =
        item.quality;


    document.getElementById(
        "auditAction"
    ).value =
        item.action;


    document.getElementById(
        "auditPriority"
    ).value =
        item.priority;


    editingAuditIndex =
        index;


    document.getElementById(
        "auditSubmitButton"
    ).textContent =
        "Save Changes";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function updateGrowthBrief() {

    const puenteData =
        PuenteStore.get();

    const interviewData =
        puenteData.profile || {};


    document.getElementById(
        "briefBusinessName"
    ).textContent =
        interviewData.businessName || "Business Name";


    document.getElementById(
        "briefIndustry"
    ).textContent =
        interviewData.industry || "Not provided";


    document.getElementById(
        "briefLocation"
    ).textContent =
        interviewData.location || "Not provided";


    document.getElementById(
        "briefCustomers"
    ).textContent =
        interviewData.customers || "Not provided";


    document.getElementById(
        "briefProducts"
    ).textContent =
        interviewData.products || "Not provided";


    document.getElementById(
        "briefAdvantages"
    ).textContent =
        interviewData.advantages || "Not provided";


    document.getElementById(
        "briefChallenges"
    ).textContent =
        interviewData.challenges || "Not provided";


    document.getElementById(
        "briefEnglishKeywords"
    ).textContent =
        interviewData.englishKeywords || "Not provided";


    document.getElementById(
        "briefSpanishKeywords"
    ).textContent =
        interviewData.spanishKeywords || "Not provided";


    let totalScore = 0;


    auditItems.forEach(function(item) {

        let platformScore = 0;

        if (item.status === "Active") {
            platformScore += 40;
        }

        else if (item.status === "Limited") {
            platformScore += 20;
        }


        if (item.quality === "Good") {
            platformScore += 60;
        }

        else if (item.quality === "Fair") {
            platformScore += 40;
        }

        else if (item.quality === "Poor") {
            platformScore += 20;
        }


        totalScore += platformScore;
    });


    let digitalPresenceScore = 0;


    if (auditItems.length > 0) {

        digitalPresenceScore =
            Math.round(
                totalScore / auditItems.length
            );
    }


    document.getElementById(
        "briefPresenceScore"
    ).textContent =
        digitalPresenceScore + " / 100";


    const platforms =
        auditItems
            .map(function(item) {
                return item.platform;
            })
            .filter(function(
                platform,
                index,
                array
            ) {
                return (
                    array.indexOf(platform) === index
                );
            });


    document.getElementById(
        "briefPlatforms"
    ).textContent =
        platforms.length > 0
            ? platforms.join(", ")
            : "None identified";


    const actionList =
        document.getElementById(
            "briefActionList"
        );


    actionList.innerHTML = "";


    const priorityOrder = {
        "High": 1,
        "Medium": 2,
        "Low": 3
    };


    const topActions =
        auditItems
            .filter(function(item) {
                return (
                    item.actionStatus !== "Completed"
                );
            })
            .sort(function(a, b) {
                return (
                    priorityOrder[a.priority] -
                    priorityOrder[b.priority]
                );
            })
            .slice(0, 3);


    if (topActions.length === 0) {

        const item =
            document.createElement("li");

        item.textContent =
            "No active priority actions.";

        actionList.appendChild(item);

    } else {

        topActions.forEach(
            function(action) {

                const item =
                    document.createElement("li");

                item.textContent =
                    action.action +
                    " - " +
                    action.platform;

                actionList.appendChild(item);
            }
        );
    }


    const businessName =
        interviewData.businessName ||
        "the client";


    const challenge =
        interviewData.challenges ||
        "limited digital visibility";


    const strategyText =
        "Puente will help " +
        businessName +
        " address " +
        challenge +
        " by strengthening its public digital presence across priority platforms, improving the completeness and consistency of its business information, and supporting English and Spanish discovery. The initial focus will be on the highest-priority actions identified in the digital audit.";


    document.getElementById(
        "briefStrategy"
    ).textContent =
        strategyText;
}
/* =========================================
   APPROVED FACTS BRIEF
========================================= */


/* -----------------------------------------
   SAVE BUSINESS-LEVEL FACTS
----------------------------------------- */

function saveBusinessFacts() {

    const hours =
        document.getElementById(
            "factHours"
        ).value.trim();

    const deliveryTerms =
        document.getElementById(
            "factDeliveryTerms"
        ).value.trim();

    const returnPolicy =
        document.getElementById(
            "factReturnPolicy"
        ).value.trim();

    const notes =
        document.getElementById(
            "factBusinessNotes"
        ).value.trim();

    const approvedBy =
        document.getElementById(
            "factApprovedBy"
        ).value.trim();


    PuenteStore.update(function(data) {

        data.approvedFacts.business = {

            ...data.approvedFacts.business,

            hours: hours,

            deliveryTerms: deliveryTerms,

            returnPolicy: returnPolicy,

            notes: notes,

            approvedBy: approvedBy,

            approvedAt:
                new Date().toISOString()
        };

    });


    document.getElementById(
        "businessFactsStatus"
    ).textContent =
        "✓ Business facts saved as owner-approved source information.";
}


/* -----------------------------------------
   ADD APPROVED PRODUCT
----------------------------------------- */

function addApprovedProduct() {

    const productName =
        document.getElementById(
            "factProductName"
        ).value.trim();

    const sku =
        document.getElementById(
            "factSku"
        ).value.trim();

    const price =
        document.getElementById(
            "factPrice"
        ).value.trim();

    const availability =
        document.getElementById(
            "factAvailability"
        ).value.trim();

    const specifications =
        document.getElementById(
            "factSpecifications"
        ).value.trim();

    const warranty =
        document.getElementById(
            "factWarranty"
        ).value.trim();

    const ordering =
        document.getElementById(
            "factOrdering"
        ).value.trim();

    const englishTerms =
        document.getElementById(
            "factEnglishTerms"
        ).value.trim();

    const spanishTerms =
        document.getElementById(
            "factSpanishTerms"
        ).value.trim();

    const approvalStatus =
        document.getElementById(
            "factApprovalStatus"
        ).value;


    if (productName === "") {

        alert(
            "Please enter a product name."
        );

        return;
    }


    const product = {

        id:
            "product-" +
            Date.now(),

        productName:
            productName,

        sku:
            sku,

        price:
            price,

        availability:
            availability,

        specifications:
            specifications,

        warranty:
            warranty,

        ordering:
            ordering,

        englishTerms:
            englishTerms,

        spanishTerms:
            spanishTerms,

        approvalStatus:
            approvalStatus,

        approvedAt:
            approvalStatus ===
            "Owner Approved"
                ? new Date().toISOString()
                : ""
    };


    PuenteStore.update(function(data) {

        data.approvedFacts.products.push(
            product
        );

    });


    clearApprovedProductForm();

    renderApprovedFacts();
}


/* -----------------------------------------
   CLEAR PRODUCT FORM
----------------------------------------- */

function clearApprovedProductForm() {

    document.getElementById(
        "factProductName"
    ).value = "";

    document.getElementById(
        "factSku"
    ).value = "";

    document.getElementById(
        "factPrice"
    ).value = "";

    document.getElementById(
        "factAvailability"
    ).value = "";

    document.getElementById(
        "factSpecifications"
    ).value = "";

    document.getElementById(
        "factWarranty"
    ).value = "";

    document.getElementById(
        "factOrdering"
    ).value = "";

    document.getElementById(
        "factEnglishTerms"
    ).value = "";

    document.getElementById(
        "factSpanishTerms"
    ).value = "";

    document.getElementById(
        "factApprovalStatus"
    ).value =
        "Owner Approved";
}


/* -----------------------------------------
   DELETE APPROVED PRODUCT
----------------------------------------- */

function deleteApprovedProduct(productId) {

    const confirmed =
        confirm(
            "Remove this product from the Approved Facts Brief?"
        );

    if (!confirmed) {
        return;
    }


    PuenteStore.update(function(data) {

        data.approvedFacts.products =
            data.approvedFacts.products.filter(
                function(product) {

                    return (
                        product.id !==
                        productId
                    );
                }
            );

    });


    renderApprovedFacts();
}


/* -----------------------------------------
   RENDER APPROVED FACTS
----------------------------------------- */

function renderApprovedFacts() {

    const data =
        PuenteStore.get();

    const businessFacts =
        data.approvedFacts.business;

    const products =
        data.approvedFacts.products;


    /* LOAD BUSINESS FACTS */

    document.getElementById(
        "factHours"
    ).value =
        businessFacts.hours || "";

    document.getElementById(
        "factDeliveryTerms"
    ).value =
        businessFacts.deliveryTerms || "";

    document.getElementById(
        "factReturnPolicy"
    ).value =
        businessFacts.returnPolicy || "";

    document.getElementById(
        "factBusinessNotes"
    ).value =
        businessFacts.notes || "";

    document.getElementById(
        "factApprovedBy"
    ).value =
        businessFacts.approvedBy || "";


    /* LOAD PRODUCT TABLE */

    const tableBody =
        document.getElementById(
            "approvedProductsTableBody"
        );


    tableBody.innerHTML = "";


    if (products.length === 0) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td colspan="6">
                No approved products added yet.
            </td>
        `;

        tableBody.appendChild(row);

        return;
    }


    products.forEach(
        function(product) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <strong>
                        ${product.productName}
                    </strong>
                </td>

                <td>
                    ${product.sku || "—"}
                </td>

                <td>
                    ${product.price || "—"}
                </td>

                <td>
                    ${product.availability || "—"}
                </td>

                <td>
                    ${product.approvalStatus}
                </td>

                <td>
                    <button
                        type="button"
                        onclick="deleteApprovedProduct(
                            '${product.id}'
                        )"
                    >
                        Remove
                    </button>
                </td>

            `;


            tableBody.appendChild(
                row
            );
        }
    );
}

/* =========================================
   SHARED DATA SYNCHRONIZATION
========================================= */

window.addEventListener(
    "puente:data-changed",
    function() {

        const data =
            PuenteStore.get();

        auditItems =
            data.auditItems || [];

        renderAuditTable();

        renderActionPlan();

        updateDashboard();

        updateGrowthBrief();

        renderApprovedFacts();
    }
);