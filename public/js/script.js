// const texts = [
//     "Transform Natural Language to SQL",
//     "Smart Schema Analysis & Query Generation"
// ];
// let index = 0, charIndex = 0, isDeleting = false;

// function typeEffect() {
//     const typingElement = document.getElementById("typing-text");
//     const currentText = texts[index];
    
//     if (!isDeleting) {
//         typingElement.textContent = currentText.slice(0, charIndex++);
//         if (charIndex > currentText.length) {
//             isDeleting = true;
//             setTimeout(typeEffect, 2000);
//             return;
//         }
//     } else {
//         typingElement.textContent = currentText.slice(0, charIndex--);
//         if (charIndex === 0) {
//             isDeleting = false;
//             index = (index + 1) % texts.length;
//         }
//     }
//     setTimeout(typeEffect, isDeleting ? 50 : 100);
// }

// // Theme Toggle
// function toggleTheme() {
//     document.body.classList.toggle("dark-mode");
//     const themeButton = document.querySelector(".theme-toggle");
//     themeButton.textContent = document.body.classList.contains("dark-mode") ? "🌞" : "🌙";
// }

// // Copy SQL to Clipboard
// function copySQL() {
//     const sqlTextarea = document.getElementById("generatedSQL");
//     sqlTextarea.select();
//     navigator.clipboard.writeText(sqlTextarea.value);
//     alert("SQL copied to clipboard!");
// }

// // Execute SQL Query
// async function runSQL() {
// const sqlQuery = document.getElementById("generatedSQL").value;

// if (!sqlQuery) {
//         alert("No SQL query to execute!");
//         return;
//     }

// try {
//     const response = await fetch('/execute', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ query: sqlQuery }),
//     });
//     const result = await response.json();

//     if (result.error) {
//         alert(result.error);
//     } else {
//         // Display the query results in the schemaTables div as a table
//         const schemaTables = document.getElementById("schemaTables");
//         schemaTables.innerHTML = formatAsTable(result.result);
//     }
// } catch (error) {
//     console.error("Error:", error);
//     alert("Failed to execute the query.");
// }
// }

// // Function to format query results as a table
// function formatAsTable(data) {
//     if (!data || data.length === 0) return "No results found.";

//     const keys = Object.keys(data[0]);
//     let table = `<table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">`;

//     // Add table headers
//     table += `<thead><tr>`;
//     keys.forEach(key => {
//         table += `<th style="padding: 10px; background-color: #f2f2f2; border: 1px solid #ddd;">${key}</th>`;
//     });
//     table += `</tr></thead>`;

//     // Add table rows
//     table += `<tbody>`;
//     data.forEach(row => {
//         table += `<tr>`;
//         keys.forEach(key => {
//             table += `<td style="padding: 10px; border: 1px solid #ddd;">${row[key]}</td>`;
//         });
//         table += `</tr>`;
//     });
//     table += `</tbody></table>`;

//     return table;
// }

// // Generate SQL Query
// document.getElementById("generateSQL").addEventListener("click", async () => {
//     const userQuery = document.getElementById("userQuery").value;

//     if (!userQuery) {
//         alert("Please enter a natural language query!");
//         return;
//     }

//     try {
//         const response = await fetch('/query', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ query: userQuery }),
//         });
//         const result = await response.json();

//         if (result.error) {
//             alert(result.error);
//         } else {
//             document.getElementById("generatedSQL").value = result.result;
//         }
//     } catch (error) {
//         console.error("Error:", error);
//         alert("Failed to generate SQL query.");
//     }
// });

// document.addEventListener("DOMContentLoaded", typeEffect);