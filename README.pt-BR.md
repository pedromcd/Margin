[English](README.md) | **Português**

# Margin — Aprenda com evidências

Um guia de estudos vivo, privado e orientado à fonte. Transforme anotações em rascunhos de revisão, compare cada rascunho com a evidência original e construa uma biblioteca em que você realmente pode confiar.

## O fluxo

1. Cole anotações ou importe um arquivo `.txt` ou `.md` em UTF-8 (até 30.000 caracteres).
2. Gere rascunhos com IA ou use o modo extrativo gratuito, que copia as frases da fonte exatamente como estão.
3. Leia o trecho original ao lado de cada rascunho. Aprove, edite, marque com tags, mescle ou descarte.
4. Pesquise os cards aprovados, navegue pelas páginas de conceitos do caderno vinculadas às fontes, pratique com flashcards, faça quizzes de resposta curta e complete sessões de revisão focadas.
5. Acompanhe sua autoavaliação de memorização e exporte um backup completo em JSON.

Material novo **nunca é aprovado automaticamente**. A demonstração, identificada como tal, inclui quatro exemplos já aprovados e seis rascunhos pendentes, para que todas as ferramentas de estudo possam ser exploradas de imediato. Os dados da demo ficam no navegador e são separados dos cadernos autenticados.

## Executar localmente

Node.js 22 ou superior:

```sh
npm ci
cp .env.example .env
npm run dev
```

Sem variáveis de ambiente, o app mostra uma tela de configuração e uma demo interativa. `npm run dev` serve apenas o frontend; use `vercel dev` ou um deploy na Vercel para testar `/api/extract`.

```sh
npm test
npm run build
```

## Deploy na Vercel

### 1. Criar o banco de dados e a autenticação

Crie um projeto no Supabase. Execute **supabase/schema.sql** uma vez no editor SQL. Ele cria os cadernos privados, as políticas de row-level security e o orçamento atômico de uso de IA. Ative a autenticação por e-mail/senha. Mantenha a confirmação de e-mail ativada e configure um provedor SMTP antes de um uso mais amplo.

Em Supabase Authentication → URL Configuration, defina a URL da Vercel como Site URL e adicione a URL exata da aplicação aos redirects permitidos. Nunca use uma chave service-role neste app.

### 2. Importar o repositório do GitHub

Na Vercel, escolha Add New → Project → importe este repositório. Framework: **Vite**. Build: `npm run build`. Output: `dist`. A Vercel faz o deploy automático da função de servidor `api/extract.js`.

Adicione estas variáveis de ambiente:

| Variável | Onde | Valor |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Navegador | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Navegador | Chave cliente anon/publishable do Supabase |
| `SUPABASE_URL` | Servidor | A mesma URL do projeto |
| `SUPABASE_ANON_KEY` | Servidor | A mesma chave cliente |
| `OPENAI_API_KEY` | Somente servidor | Sua chave da API da OpenAI |
| `OPENAI_MODEL` | Somente servidor, opcional | Padrão: `gpt-4.1-mini` |

Faça um novo deploy após alterar variáveis de ambiente. Apenas as duas variáveis `VITE_` são públicas. Nunca coloque o prefixo `VITE_` na chave da OpenAI. A geração com IA gera cobrança de uso no provedor. A geração extrativa funciona sem chave da OpenAI.

### 3. Verificar o app publicado

- Crie uma conta, confirme o e-mail e faça login.
- Adicione anotações, revise as evidências, edite um rascunho, aprove um, descarte outro e teste a mesclagem de rascunhos relacionados.
- Verifique que apenas cards aprovados aparecem na biblioteca, no caderno, nos flashcards e nos quizzes.
- Conclua uma sessão, feche a aba, reabra e confira se os dados foram salvos.
- Faça logout e abra o deploy em uma janela anônima. Nenhum conteúdo privado deve aparecer antes do login. A demo de exemplo continua disponível de propósito.
- Use uma segunda conta e verifique que o caderno dela está vazio e não consegue ler o caderno da primeira conta. O RLS do banco garante isso independentemente da interface.
- Baixe um backup pelo ícone de download no cabeçalho ou por Export notebook.

## Privacidade e embasamento

Os cadernos autenticados ficam no PostgreSQL do Supabase, restritos por `auth.uid()` via RLS. O navegador só busca um caderno após a autenticação. Os tokens de sessão são gerenciados pelo Supabase. O logout remove o caderno privado do estado da aplicação. A demo usa uma chave separada no localStorage e contém apenas material de exemplo.

Requisições de IA exigem um bearer token válido do Supabase. O servidor valida o token, aplica um limite atômico de dez gerações por conta por hora e valida cada trecho exato da fonte antes de retornar os rascunhos. Conteúdo gerado por IA é claramente identificado como interpretação. Uma evidência correspondente **não** prova que a resposta está correta: a revisão humana é obrigatória. Requisições de IA enviam as anotações fornecidas para a OpenAI; o modo extrativo não. Anotações e erros do provedor não são registrados em log pelo código da aplicação.

A mesclagem preserva os dois trechos na íntegra, exibidos juntos com uma linha em branco entre eles. Trechos mesclados podem não ser contíguos e continuam sempre vinculados à fonte original. A edição de cards nunca altera o texto da fonte.

Esta é uma aplicação pequena, com um único caderno por conta. As atualizações são serializadas dentro de uma aba; edições simultâneas em várias abas/dispositivos seguem a regra "a última gravação vence". O limite por caderno é de 5 MB. Use uma única aba para editar e exporte backups com frequência.

## Backups

As exportações incluem fontes, trechos, cards pendentes/aprovados/descartados, tags, histórico de memorização, próximas datas de revisão e resumos de sessão. Mantenha os backups privados. O JSON é portátil e legível; atualmente não há tela de restauração no app. Ele pode ser restaurado gravando os campos `sources`, `cards` e `sessions` no registro `notebooks.data` do usuário autenticado pelo painel do Supabase.

## Modelo de estudo

Flashcards e quizzes de resposta curta usam autoavaliação honesta. "Got it" agenda a próxima revisão para 1, 2, 4, 8, 16 e, no máximo, 30 dias. "Again" zera a sequência e traz o card de volta em dez minutos. Sessões focadas incluem até dez cards pendentes de revisão. Os outros modos de estudo incluem até vinte cards aprovados. A taxa de acerto é a memorização autodeclarada, não um domínio verificado de forma independente.

As páginas do caderno reúnem as respostas aprovadas e suas evidências, organizadas por fonte. Rascunhos de processos e tutoriais são suportados quando existem no material; a aplicação não inventa procedimentos ausentes das anotações. As fontes aceitam texto puro e Markdown; leitura de PDF/DOCX e OCR não estão incluídos.

## Arquitetura

- React 19 + Vite, CSS responsivo, ícones Lucide
- Autenticação por e-mail/senha do Supabase + PostgreSQL com RLS
- Função de servidor Node na Vercel para extração autenticada com IA
- OpenAI Chat Completions, saída em JSON e validação de citações no servidor
- Test runner nativo do Node para embasamento, estado de aprovação e agendamento de revisões

## Validação

O build de produção e os cinco testes de domínio passam. A autenticação real do Supabase, o RLS entre contas, as chamadas ao provedor de IA e o deploy na Vercel dependem dos serviços externos configurados por você e devem ser verificados após a configuração. Nenhuma credencial externa está incluída neste repositório.

Desenvolvido por Pedro Marques Correa Domingues como uma aplicação de estudos com humano no circuito (human-in-the-loop).
