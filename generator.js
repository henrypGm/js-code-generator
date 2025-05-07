// generator.js
// Initialize Bootstrap tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Help buttons functionality
    const helpButtons = {
        timePathHelp: {
            title: "Time Path File",
            content: "Select the text file containing time configurations for your deployments. This file should be in TXT format and contain the time values for each drop."
        },
        cheminFilesHelp: {
            title: "Seeds Folder",
            content: "Select the folder containing all your seed files (named as wmn_*.txt). Each file should contain the list of seeds for a specific drop."
        },
        cheminNegativeHelp: {
            title: "Negative Folder (Optional)",
            content: "If you're using negative files, select the folder containing them. These files should be named as 1.txt, 2.txt, etc., corresponding to your negative file numbers."
        }
    };

    // Setup help modals
    const helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
    
    Object.keys(helpButtons).forEach(buttonId => {
        document.getElementById(buttonId).addEventListener('click', function() {
            document.getElementById('helpModalTitle').textContent = helpButtons[buttonId].title;
            document.getElementById('helpModalBody').textContent = helpButtons[buttonId].content;
            helpModal.show();
        });
    });

    // Wrap text toggle functionality
    document.getElementById('wrapToggle').addEventListener('change', function() {
        const textarea = document.getElementById('generatedCode');
        textarea.wrap = this.checked ? 'soft' : 'off';
    });
});

// Set Light Mode as Default
document.body.classList.add('light-mode');
document.getElementById('modeToggle').classList.replace('fa-moon', 'fa-sun');

// Dark/Light Mode Toggle
const modeToggle = document.getElementById('modeToggle');
const body = document.body;

modeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');
    if (body.classList.contains('dark-mode')) {
        modeToggle.classList.replace('fa-sun', 'fa-moon');
    } else {
        modeToggle.classList.replace('fa-moon', 'fa-sun');
    }
});

// Negative toggle functionality
const negativeToggle = document.getElementById('negativeToggle');
const totalNegativeGroup = document.querySelector('label[for="totalNegative"]').parentElement;
const cheminNegativeGroup = document.querySelector('label[for="cheminNegative"]').parentElement;
const cheminNegativeInput = document.getElementById('cheminNegative');

function updateNegativeVisibility() {
    if (negativeToggle.checked) {
        totalNegativeGroup.style.display = 'block';
        cheminNegativeGroup.style.display = 'block';
        cheminNegativeInput.required = true;
    } else {
        totalNegativeGroup.style.display = 'none';
        cheminNegativeGroup.style.display = 'none';
        cheminNegativeInput.required = false;
    }
}

// Initial setup
updateNegativeVisibility();

// Toggle event listener
negativeToggle.addEventListener('change', updateNegativeVisibility);

// Function to get full file path
function getFullPath(fileInput) {
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return '';
    
    // Modern browsers don't allow full path access for security reasons
    // So we'll construct a likely path based on the file name
    const fileName = fileInput.files[0].name;
    const entitie = document.getElementById('entitie').value || 'WMN';
    
    // Construct a typical path structure
    return `C:\\\\Users\\\\[USERNAME]\\\\Documents\\\\iMacros\\\\Datasources\\\\${fileName.includes('Time') ? 'Time\\\\Web\\\\' : fileName.includes('wmn') ? 'Seeds\\\\Web\\\\' : 'N\\\\' + entitie + '\\\\'}${fileName}`;
}

// Function to get folder path
function getFolderPath(folderInput) {
    if (!folderInput || !folderInput.files || folderInput.files.length === 0) return '';
    
    // Modern browsers don't allow full path access for security reasons
    // So we'll construct a likely path based on the first file in the folder
    const entitie = document.getElementById('entitie').value || 'WMN';
    const folderName = folderInput.files[0].webkitRelativePath.split('/')[0];
    
    // Construct a typical path structure
    return `C:\\\\Users\\\\[USERNAME]\\\\Documents\\\\iMacros\\\\Datasources\\\\${folderInput.id === 'cheminFiles' ? 'Seeds\\\\Web\\\\' : 'N\\\\' + entitie + '\\\\'}${folderName}`;
}

// Function to generate deploy inputs
function generateDeployInputs() {
    const nbrdeploys = parseInt(document.getElementById('nbrdeploys').value) || 0;
    const nbrseeds = parseInt(document.getElementById('nbrseeds').value) || 0;
    const splitSeeds = document.getElementById('splitSeeds').checked;
    const deployInputsContainer = document.getElementById('deployInputsContainer');
    const deployInputsSection = document.getElementById('deployInputsSection');
    
    deployInputsContainer.innerHTML = ''; // Clear previous inputs

    if (nbrdeploys <= 0 || nbrseeds <= 0) {
        deployInputsSection.style.display = 'none';
        return;
    }

    deployInputsSection.style.display = 'block';

    for (let i = 1; i <= nbrdeploys; i++) {
        const from = splitSeeds ? (i - 1) * Math.floor(nbrseeds / nbrdeploys) : '';
        const to = splitSeeds ? (i === nbrdeploys ? nbrseeds : i * Math.floor(nbrseeds / nbrdeploys)) : '';
        const deployDiv = document.createElement('div');
        deployDiv.className = 'deploy-group';
        deployDiv.innerHTML = `
            <h3>Deploy ${i}:</h3>
            <div>
                <label for="from${i}">From:</label>
                <input type="number" id="from${i}" name="from${i}" value="${from}" ${splitSeeds ? 'readonly' : ''} required min="0" max="${nbrseeds}">
            </div>
            <div>
                <label for="to${i}">To:</label>
                <input type="number" id="to${i}" name="to${i}" value="${to}" ${splitSeeds ? 'readonly' : ''} required min="0" max="${nbrseeds}">
            </div>
        `;
        deployInputsContainer.appendChild(deployDiv);
    }
}

// Event listeners for seed and deploy inputs
document.getElementById('nbrseeds').addEventListener('input', generateDeployInputs);
document.getElementById('nbrdeploys').addEventListener('input', generateDeployInputs);

// Trigger input event when seed distribution changes
document.getElementById('splitSeeds').addEventListener('change', function() {
    generateDeployInputs();
});

document.getElementById('personalize').addEventListener('change', function() {
    generateDeployInputs();
});

// Form submission handler
document.getElementById('generatorForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Validate form
    const entitie = document.getElementById('entitie').value.trim();
    if (!entitie) {
        alert('Please enter an Entitie name');
        return;
    }

    // Get form values
    const nbrseeds = document.getElementById('nbrseeds').value;
    const nbrdeploys = document.getElementById('nbrdeploys').value;
    const totalDrops = document.getElementById('totalDrops').value;
    const totalNegative = negativeToggle.checked ? document.getElementById('totalNegative').value : 0;
    const midnightHour = document.getElementById('midnightHour').value;

    // Validate numbers
    if (nbrseeds <= 0 || nbrdeploys <= 0 || totalDrops <= 0 || midnightHour < 0 || midnightHour > 23) {
        alert('Please enter valid numbers for all fields');
        return;
    }

    // Time Path: File Input
    const timePathFile = document.getElementById('timePath').files[0];
    const timePath = timePathFile ? getFullPath(document.getElementById('timePath')) : '';
    if (!timePath) {
        alert('Please select a Time Path file');
        return;
    }

    // Chemin Files: Folder Input
    const cheminFilesFolder = document.getElementById('cheminFiles').files[0];
    const cheminFiles = cheminFilesFolder ? getFolderPath(document.getElementById('cheminFiles')) : '';
    if (!cheminFiles) {
        alert('Please select a Seeds Folder');
        return;
    }

    // Chemin Negative: Folder Input (Optional)
    const cheminNegativeFolder = negativeToggle.checked ? document.getElementById('cheminNegative').files[0] : null;
    const cheminNegative = negativeToggle.checked && cheminNegativeFolder ? getFolderPath(document.getElementById('cheminNegative')) : '';
    
    // Validate negative folder if negative toggle is enabled
    if (negativeToggle.checked && !cheminNegative) {
        alert('Please select a Negative Folder');
        return;
    }

    // Get deploy-specific values
    const deployValues = [];
    for (let i = 1; i <= nbrdeploys; i++) {
        const from = document.getElementById(`from${i}`).value;
        const to = document.getElementById(`to${i}`).value;
        
        // Validate deploy ranges
        if (from === '' || to === '') {
            alert(`Please fill in all deploy ranges (Deploy ${i})`);
            return;
        }
        if (parseInt(from) >= parseInt(to)) {
            alert(`Invalid range for Deploy ${i} (From must be less than To)`);
            return;
        }
        
        deployValues.push({ from, to });
    }

    // Calculate step for initial seed variables
    const step = deployValues.length > 0 ? parseInt(deployValues[0].to) - parseInt(deployValues[0].from) : Math.floor(nbrseeds / nbrdeploys);

    // Generate different code based on negative toggle
    let messagePromptCode;
    let negativeCode;
    
    if (negativeToggle.checked) {
        messagePromptCode = `var credentials =prompt("***** " + Entitie + " *****", "Negative,NbrDrop").split(',');
    var negative= "";
    var interval="";
    var nbrdrop="";
if (credentials.length >= 1)  
{
    negative = Number(credentials[0]);
    nbrdrop= credentials[1];
}
else
{
    alert("value cant be empty");
}`;

        negativeCode = `
        //-Check Max Negtive (1)
        if (negative > Total_Negative)
        {
            //alert("MAX Negative \\n");
            negative = 1 ;
        }
        
//-Negative File (On | Off//)
        ${cheminNegative ? `macrolist += 'TAG POS=1 TYPE=INPUT:FILE FORM=ID:deploy-form ATTR=ID:negative_file_input CONTENT="'+cheminNegative+'\\\\'+negative+'.txt" \\n';` : `macrolist += 'TAG POS=1 TYPE=INPUT:FILE FORM=ID:deploy-form ATTR=ID:negative_file_input CONTENT="'+cheminNegative+'\\\\'+negative+'.txt" \\n';`}
        
        //-Check Max Negtive (2)
        if (negative > Total_Negative)
        {
            // alert("MAX Negative \\n");
            negative= 1 ;
        }
        
        negative = negative + 1 ;`;
    } else {
        messagePromptCode = `var nbrdrop =prompt("***** " + Entitie + " *****", "Drop");
var nbrdrop = parseInt(nbrdrop);

if(nbrdrop == "")
{
    alert("Erreur : value cannot be empty");
}`;

        negativeCode = `// Negative functionality disabled`;
    }

    // Generate the JavaScript content
    let jsContent = `// This is a safe JavaScript file generated by the JavaScript Code Generator.
// It is intended for use with iMacros and does not contain harmful code.

/*================================= Imacros Variables ================================*/
macrolistP ="CODE:";    
macrolistP += "SET !REPLAYSPEED FAST  \\n";
macrolistP += "SET !ERRORIGNORE YES \\n";
macrolistP +="SET !TIMEOUT_PAGE 15 \\n"; 
macrolistP += "SET !TIMEOUT_STEP 1 \\n";
macrolistP += "SET !ERRORIGNORE YES \\n";
/*===================================================================================*/

/*==================================== Variables ====================================*/
var Entitie = "${entitie}"
var nbrseeds = ${nbrseeds};        
var nbrdeploys = ${nbrdeploys};
var Total_Drops = ${totalDrops};
var Total_Negative = ${totalNegative};
var Min=[00];
var Midnight_Hour = ${midnightHour};
/*===================================================================================*/

/*==================================== Paths Files ==================================*/
/*** Chemins Files ***/
var Time = "${timePath}";     
var cheminFiles = "${cheminFiles}"; 
var cheminNegative = "${cheminNegative}"; //changer chemin
/*===================================================================================*/

/*===================================== GET SEEDS ===================================*/
function deves_sseds(from,to)
{
    emails = table_seeds.slice(from,to).join("<BR>");
}

function getSeeds()
{
    for(i=1; i<=nbrseeds; i++)
    {
        var macro1  = "CODE:";
        macro1 += 'SET !DATASOURCE '+cheminFiles+'\\\\'+pack+' \\n';
        macro1 += "SET !DATASOURCE_LINE "+i+" \\n";
        macro1 += "SET !EXTRACT {{!COL1}} \\n";
        iimPlay(macro1);
        line_content = iimGetLastExtract();
        if(line_content!=""&&line_content!="\\n"&&line_content!="\\r\\n")
        {
            table_seeds.push(line_content);
        }
    }
}
/*===================================================================================*/

/*====================================== Get Date ===================================*/
//-TODAY
const today = new Date();
const yyyy = today.getFullYear();
let mm = today.getMonth() + 1;
let dd = today.getDate();
if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;
const FormattedToday = yyyy + '-' + mm + '-' +dd ;

//-TOMORROW
const Tomo = new Date();
const tomorrow = new Date(Tomo);
tomorrow.setDate(Tomo.getDate() + 1);
const ddT = String(tomorrow.getDate());
const mmT = String(tomorrow.getMonth() + 1);
const yyyyT = tomorrow.getFullYear();
const FormattedTommorw = \`\${yyyyT}-\${mmT}-\${ddT}\`;
/*===================================================================================*/

/*=================================== Message Prompt ================================*/
${messagePromptCode}
/*===================================================================================*/

/*=================================== Reporting Part ================================*/
for (var t = nbrdrop ; t <= Total_Drops ; t++)
{
//-STATIC VARIABLES
    var emails;
    var pack = 'wmn_'+t+'.txt' ;
    var table_seeds = [];    
    var m = 0;
    macrolist=macrolistP;
    getSeeds();
        
//-Seeds Variables
    var step = ${step};
    var from = ${deployValues[0]?.from || 0};
    var to = step;
    
    //-DEPLOYS
    for (g=1 ; g <= nbrdeploys ; g++)
    {
        //-TAB
        macrolist += "TAB T="+g+" \\n";
        macrolist += "SET !DATASOURCE " + Time + "\\n";
        macrolist += "SET !DATASOURCE_LINE " + t + "\\n";
        var TM ="{{!COL1}}" + Min[m];
        //-Close Success
        macrolist += "TAG POS=4 TYPE=BUTTON ATTR=TYPE:button&&CLASS:close&&DATA-DISMISS:modal&&ARIA-LABEL:Close \\n";    
        macrolist += "wait seconds=0.2 \\n";
        //Delete-Rcpt
        macrolist += "TAG POS=3 TYPE=I ATTR=CLASS:fa<SP>fa-eraser<SP>fa-sm&&TXT: \\n";    
        
        //-TIME    
        if( t < Midnight_Hour )    
        {
           macrolist += "TAG POS=1 TYPE=INPUT:TEXT FORM=ID:deploy-form ATTR=NAME:launch_at CONTENT=" + FormattedToday + "<SP>" + TM + "v \\n";
        }
        else
        {
            macrolist += "TAG POS=1 TYPE=INPUT:TEXT FORM=ID:deploy-form ATTR=NAME:launch_at CONTENT="+FormattedTommorw+"<SP>" + TM + "v \\n";    
        }
        m++;
    
${negativeCode}

        //-Seeds Insertion
        deves_sseds(from,to);
        macrolist +="TAG POS=1 TYPE=TEXTAREA FORM=ID:deploy-form ATTR=ID:rcpt_to CONTENT="+emails+"\\n";                    
        macrolist += "wait seconds= 0.2 \\n";

//-Seeds Variables
        ${deployValues.slice(1).map((deploy, index) => `
        if(g==${index + 1}){
            from = ${deploy.from};
            to = ${deploy.to};
        }
        `).join('')}
                    
    }
    
    //-iimPlay(1)
    macrolist += "TAB T=1 \\n";
    macrolist += "wait seconds= 1 \\n";
    iimPlay(macrolist);
    macrolist=macrolistP;

    //-TEST IPs
    for (g=1;g<=nbrdeploys; g++)
    {
        macrolist += "TAB T="+g+" \\n";    
        macrolist += 'TAG POS=4 TYPE=BUTTON FORM=ID:deploy-form ATTR=NAME:action_type \\n';
        macrolist += "wait seconds= 0.5 \\n";
    }
    
    //-iimPlay(2)
    macrolist += "wait seconds= 6 \\n";
    macrolist += "TAB T=1 \\n";
    iimPlay(macrolist);

    //-GENERATE MODE 
    // alert("Drop Nomber :"+ t + " Done \\n");


}
/*===================================================================================*/

/*=================================== Finish Generating ================================*/
var Nb_Dop_Generate = ( Total_Drops - nbrdrop ) ;
var Nb_Dop_Generate = ( Nb_Dop_Generate + 1 ) ;
var Total_Test = Nb_Dop_Generate * nbrdeploys ;
alert( Entitie + "\\n  Generating Nigh Finished \\n Total Test Genrated : " + Total_Test + " \\n");
/*===================================================================================*/
//--Os--//
    `;

    // Display the generated code in the textarea
    document.getElementById('generatedCode').value = jsContent;

    // Scroll to the generated code section
    document.querySelector('.generated-code-section').scrollIntoView({ behavior: 'smooth' });
});

// Function to copy the generated code to the clipboard
function copyCode() {
    const codeTextarea = document.getElementById('generatedCode');
    codeTextarea.select();
    document.execCommand('copy');
    
    // Show feedback
    const copyBtn = document.querySelector('button[onclick="copyCode()"]');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check me-2"></i>Copied!';
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
    }, 2000);
}

// Function to download the generated code as a file
function downloadCode() {
    const code = document.getElementById('generatedCode').value;
    if (!code.trim()) {
        alert('No code to download. Please generate code first.');
        return;
    }
    
    const entitie = document.getElementById('entitie').value || 'generated_code';
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entitie}.js`;
    
    // Show feedback
    const downloadBtn = document.querySelector('button[onclick="downloadCode()"]');
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<i class="fas fa-check me-2"></i>Downloaded!';
    setTimeout(() => {
        downloadBtn.innerHTML = originalText;
    }, 2000);
    
    a.click();
    URL.revokeObjectURL(url);
}