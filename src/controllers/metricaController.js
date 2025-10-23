const data = []

function novaMedicao(req, res){
    const datetime = req.body.datetime;
    const empresa = req.body.empresa;
    const codMaq = req.body.codMaquina;
    const cpu = req.body.cpu;
    const ram = req.body.ram;
    const disco = req.body.disco;
    const macAddress = req.body.mac;
    const mbEnviados = req.body.mbEnviados;
    const mbRecebidos = req.body.mbRecebidos;
    const processos = req.body.processos;

    const newData = {
        datetime, empresa, codMaq, cpu, ram, disco, macAddress, mbEnviados, mbRecebidos, processos
    }
    data.push(newData)
    res.status(200).json(data)
}

function obterMedicoesPorEmpresa(req, res){
    const empresa = req.params.empresa;

    const searchData = [];

    data.forEach(medicao => {
        console.log(medicao)
        if(medicao.empresa == empresa){
            searchData.push(medicao);
        }
    });

    res.status(200).json(searchData);
}

module.exports = {
    novaMedicao,
    obterMedicoesPorEmpresa
}