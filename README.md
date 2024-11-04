# Desafio - PUMA

## Descrição

O desafio foi implementado por completo, ou seja, o **backend** (API) consegue executar as 4 funcionalidades propostas no desafio, e o **frontend** consegue consumir a API e exibir as informações na tela executando as ações de adicionar usuário, favoritar, listar, remover e ordenar usuários pelo nome.

## Backend

O backend foi desenvolvido em **Node.js** utilizando o **Express** para criar a API, o ORM chamado **Prisma** foi escolhido para conexão com o banco de dados **PostgreSQL** que é inicializado através de um **Docker**. Para gerenciar os usuários adicionados foi criada uma *Model* chamada **User** com os campos importantes da seguinte forma:

```js
model User {
  id         String   @id @default(uuid())
  name       String?
  photo_url  String
  username   String   @unique
  favorite   Boolean  @default(false)
  created_at DateTime @default(now())
}
```

### Rotas

Para resgatar as informações necessárias do banco de dados foi utilizado o **Prisma Client** que é gerado automaticamente a partir do schema do banco de dados. As rotas criadas foram:

**Obs:** Os códigos abaixo estão simplificados, para ver o código completo acesse o arquivo `backend/src/controllers/users.js`.

- **GET** `/users`: Nessa rota é retornada a lista de usuários cadastrados no banco de dados ordenados pela data de criação.

```js
await this.#prisma.user.findMany({
    orderBy: {
        created_at: 'asc'
    }
})
```

- **POST** `/users`: Nessa rota é possível adicionar um novo usuário ao banco de dados. Para isso é necessário enviar um objeto JSON pelo `body` com o campo `username`, logo, o backend irá buscar o usuário na API do GitHub e salvar as informações no banco de dados, caso o usuário exista.

```js
const response = await fetch(`${GITHUB_URL}/users/${body.username}`)
const data = await response.json()

await this.#prisma.user.create({
    data: {
        username: data.login,
        name: data.name,
        photo_url: data.avatar_url
    }
})
```

- **DELETE** `/users/:username`: Nessa rota é possível remover um usuário do banco de dados. Para isso é necessário enviar o `username` do usuário que deseja remover.

```js
await this.#prisma.user.delete({
    where: {
        username: params.username
    }
})
```

- **PATCH** `/users/:username/toggle-star`: Nessa rota é possível dar uma estrela ou retira-la de um usuário. Para isso é necessário enviar o `username` do usuário que deseja favoritar.

```js
const user = await this.#prisma.user.findFirst({
    where: {
        favorite: true
    }
})

if (user) {
    const update = await this.#prisma.user.update({
        where: {
            username: user.username
        },
        data: {
            favorite: false
        }
    })

    if (user.username === params.username) return update
}

return await this.#prisma.user.update({
    where: {
        username: params.username
    },
    data: {
        favorite: true
    }
})
```

### Execução do Backend

Para executar o backend é necessário ter o **Node.js** e o **Docker** instalados na máquina. Primeiramente, clone o repositório e acesse a pasta do projeto:

```bash
cd backend
```

Instale as dependências do projeto, inicialize o banco de dados e migre as tabelas utilizando o **Prisma**:

```bash
npm install

docker compose -f docker-compose.yml up -d
# pode ser necessário rodar o comando acima como "sudo":
# sudo docker compose -f docker-compose.yml up -d

npx prisma migrate deploy

npx prisma generate
```

Por fim, execute o backend:

```bash
npm start
```

### Execução dos Testes

Aqui as dependências do projeto já devem estar instaladas, então basta executar os comando para rodar os testes:

```bash
cd backend

docker compose -f docker-compose.test.yml up -d
# pode ser necessário rodar o comando acima como "sudo":
# sudo docker compose -f docker-compose.test.yml up -d

DATABASE_PORT=5433 npx prisma migrate deploy 

npm test
```

## Frontend

O frontend foi desenvolvido em **Vue.js** utilizando o **Vite** para criar o projeto. Para consumir a API do backend foi utilizado o **Fetch** e para estilizar a aplicação foi utilizado o **TailwindCSS** junto ao **shadcn/vue** e o **Lucide** para os ícones.

### Execução do Frontend

Para executar o frontend é necessário ter o **Node.js** instalado na máquina. Primeiramente, clone o repositório e acesse a pasta do projeto:

```bash
cd frontend
```

Instale as dependências do projeto e execute o frontend:

```bash
npm install

npm run dev
```