const fs = require("fs");
const readline = require("readline");

// Interface de entrada e saída
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Arquivo para persistência
const ARQUIVO = "alunos.json";

// Carrega alunos do arquivo JSON (se existir)
let alunos = [];
if (fs.existsSync(ARQUIVO)) {
    try {
        alunos = JSON.parse(fs.readFileSync(ARQUIVO));
    } catch {
        alunos = [];
    }
}

// --- MENU PRINCIPAL ---
const menu = () => {
    console.log("=== MENU ===");
    console.log("1 - Cadastrar aluno");
    console.log("2 - Listar alunos");
    console.log("3 - Buscar aluno");
    console.log("4 - Editar aluno");
    console.log("5 - Remover aluno");
    console.log("6 - Média geral da turma");
    console.log("7 - Aluno com maior média");
    console.log("8 - Relatórios");
    console.log("9 - relatório");
    console.log("0 - Sair");

    rl.question("Escolha uma opção: ", (opcao) => {
        switch (opcao) {
            case "1": cadastrarAluno(); break;
            case "2": listarAlunos(); break;
            case "3": buscarAluno(); break;
            case "4": editarAluno(); break;
            case "5": removerAluno(); break;
            case "6": mediaGeral(); break;
            case "7": melhorAluno(); break;
            case "8": relatorios(); break;
            case "9": rRelatorio(); break;
            case "0": console.log("Saindo..."); rl.close(); break;
            default: console.log("Opção inválida!\n"); menu(); break;
        }
    });
};

//  FUNÇÕES AUXILIARES - VALIDAÕES NO GERAL E CÁLCULOS

// Salvar alunos no arquivo
const salvarDados = () => {
    fs.writeFileSync(ARQUIVO, JSON.stringify(alunos, null, 2));
};

// Calcular média de um array de notas
const media = (notas) =>
    notas.reduce((soma, n) => soma + n, 0) / notas.length;

// Validar se todas as notas estão entre 0 e 10
const notasValidas = (notas) =>
    notas.length > 0 && notas.every((n) => !isNaN(n) && n >= 0 && n <= 10);

// FUNCIONALIDADES PRINCIPAIS DO CÓDIGO

// 1) Cadastrar aluno
const cadastrarAluno = () => {
    rl.question("Nome do aluno: ", (nome) => {
        if (!nome.trim()) {
            console.log("O nome não pode ser vazio.\n");
            return cadastrarAluno();
        }

        if (alunos.some((a) => a.nome.toLowerCase() === nome.toLowerCase())) {
            console.log("Já existe um aluno com esse nome.\n");
            return cadastrarAluno();
        }

        rl.question("Idade: ", (idadeStr) => {
            const idade = Number(idadeStr);
            if (isNaN(idade) || idade <= 0) {
                console.log("A idade deve ser um número positivo.\n");
                return cadastrarAluno();
            }

            rl.question("Notas separadas por vírgula (ex: 7,8,9): ", (notasStr) => {
                const notas = notasStr
                    .split(",")
                    .map((n) => Number(n.trim()))
                    .filter((n) => !isNaN(n));

                if (!notasValidas(notas)) {
                    console.log("Todas as notas devem ser números entre 0 e 10.\n");
                    return cadastrarAluno();
                }

                alunos.push({ nome, idade, notas });
                salvarDados();
                console.log("Aluno cadastrado com sucesso!\n");
                menu();
            });
        });
    });
};

// 2) Listar alunos
const listarAlunos = () => {
    if (alunos.length === 0) {
        console.log("Nenhum aluno cadastrado.\n");
        return menu();
    }

    alunos.forEach(({ nome, idade, notas }, i) => {
        console.log(
            `${i + 1}. ${nome} | Idade: ${idade} | Notas: ${notas.join(", ")} | Média: ${media(notas).toFixed(2)}`
        );
    });
    console.log("");
    menu();
};

// 3) Buscar aluno
const buscarAluno = () => {
    rl.question("Digite o nome para busca: ", (busca) => {
        const resultado = alunos.filter((a) =>
            a.nome.toLowerCase().includes(busca.toLowerCase())
        );

        if (resultado.length === 0) {
            console.log("Nenhum aluno encontrado.\n");
        } else {
            resultado.forEach(({ nome, idade, notas }) => {
                console.log(`${nome} | Idade: ${idade} | Média: ${media(notas).toFixed(2)}`);
            });
        }
        menu();
    });
};

// 4) Editar aluno
const editarAluno = () => {
    rl.question("Digite o nome do aluno a editar: ", (busca) => {
        const aluno = alunos.find((a) => a.nome.toLowerCase() === busca.toLowerCase());
        if (!aluno) {
            console.log("Aluno não encontrado.\n");
            return menu();
        }

        rl.question(`Novo nome (${aluno.nome}): `, (nome) => {
            if (nome.trim() && !alunos.some((a) => a.nome.toLowerCase() === nome.toLowerCase() && a !== aluno)) {
                aluno.nome = nome;
            }

            rl.question(`Nova idade (${aluno.idade}): `, (idadeStr) => {
                const idade = Number(idadeStr);
                if (!isNaN(idade) && idade > 0) aluno.idade = idade;

                rl.question(`Novas notas (${aluno.notas.join(", ")}): `, (notasStr) => {
                    const notas = notasStr
                        .split(",")
                        .map((n) => Number(n.trim()))
                        .filter((n) => !isNaN(n));
                    if (notasValidas(notas)) aluno.notas = [...notas];

                    salvarDados();
                    console.log("✅ Aluno atualizado!\n");
                    menu();
                });
            });
        });
    });
};

// 5) Remover aluno
const removerAluno = () => {
    rl.question("Digite o nome do aluno a remover: ", (busca) => {
        const index = alunos.findIndex((a) => a.nome.toLowerCase() === busca.toLowerCase());
        if (index === -1) {
            console.log("Aluno não encontrado.\n");
        } else {
            alunos.splice(index, 1);
            salvarDados();
            console.log("✅ Aluno removido com sucesso!\n");
        }
        menu();
    });
};

// 6) Média geral da turma
const mediaGeral = () => {
    if (alunos.length === 0) {
        console.log("Nenhum aluno cadastrado.\n");
        return menu();
    }
    const mediaTurma = alunos.reduce((acc, { notas }) => acc + media(notas), 0) / alunos.length;
    console.log(`Média geral da turma: ${mediaTurma.toFixed(2)}\n`);
    menu();
};

// 7) Melhor aluno
const melhorAluno = () => {
    if (alunos.length === 0) {
        console.log("Nenhum aluno cadastrado.\n");
        return menu();
    }
    const top = alunos.reduce((prev, curr) =>
        media(curr.notas) > media(prev.notas) ? curr : prev
    );
    console.log(`Aluno com maior média: ${top.nome} (${media(top.notas).toFixed(2)})\n`);
    menu();
};

// 8) Relatórios
const relatorios = () => {
    if (alunos.length === 0) {
        console.log("Nenhum aluno cadastrado.\n");
        return menu();
    }

    const aprovados = alunos.filter(({ notas }) => media(notas) >= 7);
    const recuperacao = alunos.filter(({ notas }) => {
        const m = media(notas);
        return m >= 5 && m < 7;
    });
    const reprovados = alunos.filter(({ notas }) => media(notas) < 5);

    console.log("Aprovados:");
    aprovados.map((a) => console.log(`- ${a.nome} (média: ${media(a.notas).toFixed(2)})`));

    console.log("\nRecuperação:");
    recuperacao.map((a) => console.log(`- ${a.nome} (média: ${media(a.notas).toFixed(2)})`));

    console.log("\nReprovados:");
    reprovados.map((a) => console.log(`- ${a.nome} (média: ${media(a.notas).toFixed(2)})`));

    console.log("");
    menu();
};

// 9) Exportar relatório
const rRelatorio = () => {
    if (alunos.length === 0) {
        console.log("Nenhum aluno cadastrado.\n");
        return menu();
    }

    const linhas = alunos.map(({ nome, idade, notas }) =>
        `${nome} | Idade: ${idade} | Notas: ${notas.join(", ")} | Média: ${media(notas).toFixed(2)}`
    );

    fs.writeFileSync("relatorio.txt", linhas.join("\n"));
    console.log("📄 Relatório exportado para relatorio.txt\n");
    menu();
};

//Inicia o programa 
menu();
