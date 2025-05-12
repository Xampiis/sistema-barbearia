// Data storage
let data = [];
let services = [];

// Utility function to calculate commission
function calculateCommission(amount) {
    return parseFloat((amount * 0.05).toFixed(2));
}

// Lista de Barbeiros
let barbers = [
    { id: 1, name: "Thiago" },
    { id: 2, name: "Fernando" },
    { id: 3, name: "Diego" }
];

// Atualizar dropdown de barbeiros
function updateBarberList() {
    const barberDropdown = document.getElementById('barberName');
    barberDropdown.innerHTML = '<option value="">Selecione o Barbeiro</option>'; // Reset options

    barbers.forEach(barber => {
        const option = document.createElement('option');
        option.value = barber.name;
        option.textContent = barber.name;
        barberDropdown.appendChild(option);
    });
}

// Atualizar lista de barbeiros no relatório
function updateBarberReportList() {
    const reportBarberDropdown = document.getElementById('reportBarber');
    reportBarberDropdown.innerHTML = '<option value="">Selecione o Barbeiro</option>'; // Reset options

    barbers.forEach(barber => {
        const option = document.createElement('option');
        option.value = barber.name;
        option.textContent = barber.name;
        reportBarberDropdown.appendChild(option);
    });
}

// Adicionar novo registro
function addRecord() {
    const barberName = document.getElementById('barberName').value;
    const itemName = document.getElementById('itemName').value;
    const discount = parseFloat(document.getElementById('discount').value) || 0;

    if (!barberName || !itemName) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const selectedService = services.find(service => service.serviceName === itemName);
    if (!selectedService) {
        alert('Serviço selecionado não encontrado.');
        return;
    }

    const amount = selectedService.servicePrice;
    const commission = calculateCommission(amount);
    const net = parseFloat((amount - discount + commission).toFixed(2));

    data.push({ barberName, itemName, amount, commission, discount, net });

    updateTable();
    clearInputs();
}

// Adicionar novo serviço
function addService() {
    const serviceName = document.getElementById('serviceName').value;
    const servicePrice = parseFloat(document.getElementById('servicePrice').value) || 0;

    if (!serviceName || servicePrice <= 0) {
        alert('Por favor, preencha todos os campos de serviço corretamente.');
        return;
    }

    if (services.some(service => service.serviceName === serviceName)) {
        alert('Serviço já cadastrado.');
        return;
    }

    services.push({ serviceName, servicePrice });
    updateServiceList();
    clearServiceInputs();
}

// Atualizar dropdown de serviços
function updateServiceList() {
    const serviceDropdown = document.getElementById('itemName');
    serviceDropdown.innerHTML = '<option value="">Selecione o Serviço/Produto</option>';

    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.serviceName;
        option.textContent = `${service.serviceName} - R$${service.servicePrice.toFixed(2)}`;
        serviceDropdown.appendChild(option);
    });
}

// Atualizar tabela
function updateTable() {
    const tableBody = document.getElementById('dataTableBody');
    tableBody.innerHTML = '';

    data.forEach((entry, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${entry.barberName}</td>
            <td>${entry.itemName}</td>
            <td>R$${entry.amount.toFixed(2)}</td>
            <td>R$${entry.commission.toFixed(2)}</td>
            <td>R$${entry.discount.toFixed(2)}</td>
            <td>R$${entry.net.toFixed(2)}</td>
            <td><button onclick="deleteRecord(${index})">Excluir</button></td>
        `;

        tableBody.appendChild(row);
    });
}

// Deletar registro
function deleteRecord(index) {
    data.splice(index, 1);
    updateTable();
}

// Limpar campos do formulário
function clearInputs() {
    document.getElementById('barberName').value = '';
    document.getElementById('itemName').value = '';
    document.getElementById('discount').value = '';
}

function clearServiceInputs() {
    document.getElementById('serviceName').value = '';
    document.getElementById('serviceDescription').value = '';
    document.getElementById('servicePrice').value = '';
}

// Gerar relatório em PDF
async function generateIndividualReportAsPDF() {
    const selectedBarber = document.getElementById("reportBarber").value;

    if (!selectedBarber) {
        alert("Por favor, selecione um barbeiro para gerar o relatório.");
        return;
    }

    const barberData = data.filter(entry => entry.barberName === selectedBarber);

    if (barberData.length === 0) {
        alert(`Não há registros para o barbeiro: ${selectedBarber}.`);
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text(`Relatório de ${selectedBarber}`, 20, 20);

    let yPosition = 40;
    pdf.setFontSize(12);
    pdf.text('Serviço', 20, yPosition);
    pdf.text('Valor', 70, yPosition);
    pdf.text('Comissão', 100, yPosition);
    pdf.text('Desconto', 130, yPosition);
    pdf.text('Líquido', 160, yPosition);

    yPosition += 10;

    let totalCommission = 0;
    let totalNet = 0;

    barberData.forEach(entry => {
        pdf.text(entry.itemName, 20, yPosition);
        pdf.text(`R$${entry.amount.toFixed(2)}`, 70, yPosition, { align: "right" });
        pdf.text(`R$${entry.commission.toFixed(2)}`, 100, yPosition, { align: "right" });
        pdf.text(`R$${entry.discount.toFixed(2)}`, 130, yPosition, { align: "right" });
        pdf.text(`R$${entry.net.toFixed(2)}`, 160, yPosition, { align: "right" });

        totalCommission += entry.commission;
        totalNet += entry.net;
        yPosition += 10;

        // Adicionar uma nova página se ultrapassar o limite
        if (yPosition > 280) {
            pdf.addPage();
            yPosition = 20;
        }
    });

    yPosition += 10;
    pdf.setFontSize(14);
    pdf.text(`Total Comissão: R$${totalCommission.toFixed(2)}`, 20, yPosition);
    pdf.text(`Total Líquido: R$${totalNet.toFixed(2)}`, 20, yPosition + 10);

    pdf.save(`${selectedBarber}_Relatorio.pdf`);
}


// Seleção do modal e elementos relacionados
const modal = document.getElementById("myModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.querySelector("#myModal .close");

// Abrir o modal
openModalBtn.onclick = () => {
    modal.style.display = "flex"; // Usa "flex" para centralizar
};

// Fechar o modal ao clicar no "x"
closeModalBtn.onclick = () => {
    modal.style.display = "none";
};

// Fechar o modal ao clicar fora do conteúdo
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Modal para Relatório Individual
const individualReportModal = document.getElementById("individualReportModal");
const openIndividualReportModal = document.getElementById("generateIndividualReportBtn");
const closeIndividualReportModal = document.getElementById("closeIndividualReportModal");

// Abrir o modal
openIndividualReportModal.onclick = () => {
    individualReportModal.style.display = "flex"; // Usa "flex" para centralizar
};

// Fechar o modal ao clicar no "x"
closeIndividualReportModal.onclick = () => {
    individualReportModal.style.display = "none";
};

// Fechar o modal ao clicar fora do conteúdo
window.onclick = (event) => {
    if (event.target === individualReportModal) {
        individualReportModal.style.display = "none";
    }
};

// Event listeners
window.onload = () => {
    updateBarberList();
    updateBarberReportList();
    document.getElementById('addRecordBtn').addEventListener('click', addRecord);
    document.getElementById('addServiceBtn').addEventListener('click', addService);
    document.getElementById("generateIndividualReportPDFBtn").addEventListener("click", generateIndividualReportAsPDF);
};
