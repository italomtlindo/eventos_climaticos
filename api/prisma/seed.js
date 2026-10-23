
const prisma = require('../src/data/prisma')

async function main() {
  await prisma.$transaction(async (transaction) => {
    await transaction.evento.deleteMany()
    await transaction.usuario.deleteMany()

    await transaction.usuario.createMany({
      data: [
        { nome: "Ana Silva", email: "ana@email.com", senha: "senha123" },
        { nome: "Maria Silva", email: "maria@email.com", senha: "senha123" },
        { nome: "João Oliveira", email: "joao@email.com", senha: "senha123" },
        { nome: "Paula Martins", email: "paula@email.com", senha: "senha123" },
        { nome: "Pedro Souza", email: "pedro@email.com", senha: "senha123" }
      ]
    })

    await transaction.evento.createMany({
      data: [
        { usuarioId: 1, cidade: "Amparo", tipoEvento: "Tempestade", temperaturaMaxima: 34.2, nivelImpacto: "Derrubada de árvores e destelhamento de edifícios" },
        { usuarioId: 1, cidade: "Campinas", tipoEvento: "Queimada", temperaturaMaxima: 38.2, nivelImpacto: "Perda de mata atlântica e área agrícola" },
        { usuarioId: 2, cidade: "Jaguariúna", tipoEvento: "Tempestade Magnética", temperaturaMaxima: 30.1, nivelImpacto: "Acidentes com pessoas atingidas por raios" },
        { usuarioId: 2, cidade: "Pedreira", tipoEvento: "Tempestade", temperaturaMaxima: 34.2, nivelImpacto: "Derrubada de árvores e destelhamento de edifícios" },
        { usuarioId: 3, cidade: "Monte Alegre do Sul", tipoEvento: "Vendaval", temperaturaMaxima: 36.2, nivelImpacto: "Derrubada de árvores e destelhamento de edifícios" },
        { usuarioId: 3, cidade: "Santo Antônio de Posse", tipoEvento: "Baixa umidade relativa do ar", temperaturaMaxima: 39.7, nivelImpacto: "Excesso de atendimento a pessoas com problemas respiratórios" },
        { usuarioId: 4, cidade: "Serra Negra", tipoEvento: "Geada", temperaturaMaxima: 6.2, nivelImpacto: "Perda de produção agrícola" },
        { usuarioId: 5, cidade: "Águas de Lindóia", tipoEvento: "Tempestade", temperaturaMaxima: 34.8, nivelImpacto: "Derrubada de árvores e destelhamento de edifícios" }
      ]
    })
  })

  console.log("Usuários e eventos cadastrados com sucesso!")
}

main()
  .catch((erro) => {
    console.error(erro)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
