let generatedQuestion = "";

async function goToStep2() {
    const complaint = document.getElementById("complaint").value.trim();
    const apiKey = document.getElementById("apiKey").value.trim();

    if (!complaint || !apiKey) {
        alert("Complaint aur API key dono fill karo");
        return;
    }

    document.getElementById("step2").style.display = "block";
    document.getElementById("aiQuestion").innerText = "Generating question...";

    generatedQuestion = await generateAIQuestion(complaint, apiKey);

    document.getElementById("aiQuestion").innerText = generatedQuestion;
}

async function generateAIQuestion(complaintText, apiKey) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `User complaint: ${complaintText}. Ask one short and relevant follow-up question.`
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();
        console.log("Gemini Response:", data);

        if (data.error) {
            return data.error.message;
        }

        if (!data.candidates || data.candidates.length === 0) {
            return "No response from AI";
        }

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Fetch Error:", error);
        return "Error generating question";
    }
}

function submitComplaint() {
    const name = document.getElementById("name").value.trim();
    const city = document.getElementById("city").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const complaint = document.getElementById("complaint").value.trim();
    const answer = document.getElementById("answer").value.trim();

    // ✅ Validation
    if (!name || !city || !mobile || !complaint) {
        alert("Sab fields fill karo");
        return;
    }

    const complaintData = {
        id: Date.now(), // 🔥 unique id (duplicate avoid)
        name,
        city,
        mobile,
        complaint,
        aiQuestion: generatedQuestion || "N/A",
        answer: answer || "N/A"
    };

    let complaints = JSON.parse(localStorage.getItem("complaints")) || [];

    // ✅ duplicate check (same mobile + complaint)
    const isDuplicate = complaints.some(
        item => item.mobile === mobile && item.complaint === complaint
    );

    if (isDuplicate) {
        alert("Ye complaint already submit ho chuki hai");
        return;
    }

    complaints.push(complaintData);

    localStorage.setItem("complaints", JSON.stringify(complaints));

    alert("Complaint submitted!");
    window.location.href = "index.html";
}