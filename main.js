
const API_URL = 'http://localhost:3000';

// Data storage
let barbers = []; // Será carregado do backend
let services = []; // Será carregado do backend
let data = []; // Para armazenar os registros temporários

// Utility function to calculate commission
function calculateCommission(amount) {
    return parseFloat((amount * 0.05).toFixed(2));
}

// Atualizar dropdown de barbeiros
function updateBarberList() {
    const barberDropdown = document.getElementById('barberName');
    barberDropdown.innerHTML = '<option value="">Selecione o Barbeiro</option>';

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
    reportBarberDropdown.innerHTML = '<option value="">Selecione o Barbeiro</option>';

    barbers.forEach(barber => {
        const option = document.createElement('option');
        option.value = barber.name;
        option.textContent = barber.name;
        reportBarberDropdown.appendChild(option);
    });
}

// Obter Lista de Barbeiros do Servidor
async function fetchBarbers() {
    try { 
        const response = await fetch(`${API_URL}/barbeiros`);
        const barbersFromServer = await response.json();
        barbers = barbersFromServer;
        updateBarberList();
        updateBarberReportList();
    } catch (error) {
        console.error('Erro ao obter barbeiros:', error);
        alert('Não foi possível carregar a lista de barbeiros.');
    }
}

// Adicionar Barbeiro ao Servidor
async function addBarber(name) {
    try {
        const response = await fetch(`${API_URL}/barbeiros`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: name }),
        });
        if (!response.ok) throw new Error('Erro ao adicionar barbeiro');
        await fetchBarbers();
    } catch (error) {
        console.error('Erro ao adicionar barbeiro:', error);
        alert('Não foi possível adicionar o barbeiro.');
    }
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
async function addServiceToServer(barberId, description, value) {
    try {
        const response = await fetch(`${API_URL}/servicos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barbeiro_id: barberId, descricao: description, valor: value }),
        });
        if (!response.ok) throw new Error('Erro ao adicionar serviço');
        await fetchServices();
    } catch (error) {
        console.error('Erro ao adicionar serviço:', error);
        alert('Não foi possível adicionar o serviço.');
    }
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

// Obter Lista de Serviços do Servidor
async function fetchServices() {
    try {
        const response = await fetch(`${API_URL}/servicos`);
        const servicesFromServer = await response.json();
        services = servicesFromServer.map(service => ({
            serviceName: service.descricao,
            servicePrice: service.valor,
        }));
        updateServiceList();
    } catch (error) {
        console.error('Erro ao obter serviços:', error);
        alert('Não foi possível carregar a lista de serviços.');
    }
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

// Modals
function setupModals() {
    const modal = document.getElementById("myModal");
    const openModalBtn = document.getElementById("openModalBtn");
    const closeModalBtn = document.querySelector("#myModal .close");

    openModalBtn.onclick = () => {
        modal.style.display = "flex";
    };

    closeModalBtn.onclick = () => {
        modal.style.display = "none";
    };

    const individualReportModal = document.getElementById("individualReportModal");
    const openIndividualReportModal = document.getElementById("generateIndividualReportBtn");
    const closeIndividualReportModal = document.getElementById("closeIndividualReportModal");

    openIndividualReportModal.onclick = () => {
        individualReportModal.style.display = "flex";
    };

    closeIndividualReportModal.onclick = () => {
        individualReportModal.style.display = "none";
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
        if (event.target === individualReportModal) {
            individualReportModal.style.display = "none";
        }
    };
}

// Inicialização
window.onload = async () => {
    await fetchBarbers();
    await fetchServices();
    document.getElementById('addRecordBtn').addEventListener('click', addRecord);
    document.getElementById('addServiceBtn').addEventListener('click', () => {
        const serviceName = document.getElementById('serviceName').value;
        const servicePrice = parseFloat(document.getElementById('servicePrice').value) || 0;
        addServiceToServer(null, serviceName, servicePrice);
    });
    document.getElementById("generateIndividualReportPDFBtn").addEventListener("click", generateIndividualReportAsPDF);
    setupModals();
};
