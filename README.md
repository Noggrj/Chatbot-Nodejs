
==================
* [Guia](#guia)
    * [Como funciona](#como-funciona)
    * [Lista de parâmetros](#lista-de-parametros)
    * [Scripts](#scripts)
    * [API](#api)
    * [Versão Node.js](#versao-nodejs)

==================

# Guia

O comando seguinte permite impedir a execução de certos *scripts*:
```sh
node index.js --except="<lista_de_parametros>"
```

"<lista_de_parametros>" corresponde aos scripts a serem **ignorados**. As opções são as seguintes:

* "encerrar"
* "names"
* "tags"
* "attempts"
* "inatividade"
* "keywords"
* "tempoEspera"
* "contactJourney"
* "eventtrackers"

Caso o parâmetro seja "*only*", a lista conterá os *scripts* a serem **executados**.

```sh
node index.js --only="<lista_de_parametros>"
```

> Nos parâmetros "except" e "only", as opções devem ser escritas separadas por espaço. Exemplo: node index.js --except="encerrar names"

O comando seguinte executa todos os *scripts*:
```sh
npm start
```

## Como funciona

Você colocará seus bots, em formato JSON, dentro da pasta /json. Após executar os comandos supracitados, o *script* irá considerar todos os arquivos da pasta "/json" e salvará seus novos bots dentro da pasta "/json-parsed", com os mesmos nomes.


## Lista de parametros

* **except** ou **e**: impede a execução dos scripts informados.
* **only** ou **o**: executa apenas os *scripts* informados.
* **all**: executa a mudança em **todos** os nomes em ações de entrada e saída. **Sem este parâmetro**, altera-se os nomes apenas naquelas ações que têm o nome padrão atribuído pelo Blip (Ex.: "Executar script", "Definir contato", etc), ou seja, altera apenas aqueles títulos que não foram alterados.
* **attempts**: indica a quantidade de tentativas para o bloco de tentativas de erros, antes de ser enviado ao atendimento humano. **Default: 2**.
* **std**: *flag* para indicar onde a condição de saída de *attempts.js* será aplicada: quando *std* **não** é definida, a condição de saída será "resposta do usuário -> existe -> Tratativa de erros" como condição final, caso contrário irá para a saída padrão. **Default: false**.
* **afk**: tempo de inatividade para os blocos que esperam entrada do usuário e o bloco de espera após inatividade. Os tempos devem ser informados em minutos e separados por espaço. Ex.: `--afk="30 60"`
* **keywords** ou **k**: lista de palavras-chave a serem adicionadas nas condições de saída em todos os blocos do *bot*. Cada palavra-chave deve ser precedida do ID do bloco destino (botão direito -> Copiar ID, dentro do Blip). Ex.: `--k="ff604a19-e182-45b0-8f38-11b2693bf7c8 'menu|voltar ao menu|inicio' ff604a19-e182-45b0-8f38-11b2693bf7c8 'produto|comprar'"`
    - A expressão regular deve ser escrita entre **aspas simples**, como no exemplo.
    - Os IDs não devem conflitar entre fluxos (*uuid* tem probabilidade muito pequena de colisão).
* **interval**: indica o valor do intervalo de espera (em ms). **Default: 1000**.
* **pushIntervals**: se presente, adiciona intervalos de espera em todos os blocos.
* **intervalPos**: **0** para inserir o intervalo de espera no início, **1** para inserir no fim. **Default: 0**.
* **actiontype**: "entering" para uma ação de entrada e "leaving" para uma ação de saída do bloco, caso uma opção diferente seja informada o script irá adotar a ação "leaving" como padrão.

Exemplo:
```sh
node index.js --except="encerrar tags" --all --attempts="3" --std --afk="30 60"
```

## *Scripts*

* **encerrar.js**: Inclui a condição de saída "Se resposta do usuário contém *encerrar* ou *sair*, direciona para o bloco de nome "*Encerrar*" em todos aqueles que esperam entrada do usuário.
    - Caso exista um bloco com nome **Encerrar** no fluxo, as condições de saída serão direcionadas a ele. Caso não exista, esse bloco será criado.
* **namesAndTitles.js**: Adequa os nomes de ações de entrada e saída de acordo com o [manual de boas práticas da Blip](https://drive.google.com/drive/folders/1s5z6nZ0PfiiQbZlb2KPtpdlLveXYPZ4Q).
* **tags.js**: Adciona as *tags* nos blocos de acordo com as ações de entrada e saída presentes.
    - É possível alterar manualmente as cores das *tags* definidas no código.
* **attempts.js**: Adiciona a possibilidade de errar "X" vezes e direcionar ao bloco de nome "*Atendimento humano*". 
    - Caso existam blocos com os nomes **Tratativa de erros** e **Atendimento humano**, as condições de saída serão direcionadas a eles. Caso não existam, esses blocos serão criados automaticamente. 
    - Cada bloco com *input* do usuário terá sua condição de saída correspondente no bloco de tratativas de erros, portanto a quantidade destes blocos não deve ultrapassar **25** (limite de condições de saída da plataforma Blip). É possível inserir mais que 25 condições de saída, porém o comportamento da plataforma é uma incógnita (não sei se a quantidade é limitada apenas na interface *front end*).
    - Será adicionado *script* e **redirecionamento** nas ações de entrada e saída no bloco de atendimento humano, caso ele não exista e tenha sido criado por este *script*.
* **inatividade.js**: Adiciona tempos de inatividade em todas as entradas de usuário. É diferenciado o tempo de inatividade do bloco de espera após inatividade e dos demais blocos.
    - É possível alterar manualmente as cores das *tags* definidas no código.
    - Serão criados dois blocos, caso não existam: **Inatividade** e **Finalização por inatividade**.
* **keywords.js**: Adiciona *keywords* em todas as entradas de usuário com a condição de saída para um bloco específico definido pelo seu ID. É tido como premissa que não haverá IDs iguais entre todos os fluxos adicionados na pasta /json.
    - O valor pra condição de saída é um único *regex*.
* **tempoEspera.js**: Adiciona ou altera intervalos de espera ("digitando") nos blocos do fluxo.
* **contactJourney.js**: Adiciona em todos os blocos do fluxo um script responsável por guardar o nome do bloco em uma lista chamada contactJourney
    - Por padrão, é inserido em todo bloco de início de um bot um método que tenta obter a jornada do contato a partir do redirectObject (Comunicação entre bots).
* **addEventTrackers.js**: Por enquanto, adiciona registro de evento para capturar exceções no bloco de exceções.

## API

API para uso nos *bots* da Blip. O servidor é iniciado no *server.js*.
```sh
node server.js
```

### Builder

#### Direcionar o contato para um bloco específico em qualquer subbot
Certifique-se que o contexto do roteador está **ligado**.

* **Method**: POST
* **Endpoint**: /builder/change-user-state
* **Body**:
```json
{
    "identity": "553199998888@wa.gw.msging.net",
    "routerKey": "Key ol90ZWFkn3J0ZTN0ZTI4Ok5wT2h2dDJTeUFSanBDZzY0S01j",
    "botId": "botexample42",
    "flowId": "e8d31868-5863-4a58-93e9-3b8becc05b3b",
    "blockId": "55882e6b-f0f4-41d3-8450-792db744ab53",
    "reset": false
}
```
* **Response status**: 202


"*identity*" pode ser encontrado na requisição seguinte (/contacts/get-user-identity).

"routerKey" é a chave do bot roteador (Configurações -> Informações de conexão -> Endpoints HTTP -> Cabeçalho de autenticação (*Authorization*)).

"botId" é o ID do bot (Home -> <ID abaixo do nome do *bot*>).

"flowId" é o identificador do fluxo, associado ao *subbot* (Configuração -> Identificador do fluxo).

"blockId" é o ID do bloco para onde o usuário será direcionado (botão direito no bloco -> Copiar ID).

"reset" informa se o contato será resetado (**todas** as variáveis de contexto serão deletadas - as variáveis salvas nos blocos). *Boolean*. **Default**: false.


> Exemplos

* Enviar contato para o bloco de início do *bot* principal, mantendo as demais variáveis de contexto:
```json
{
    "identity": "553199998888@wa.gw.msging.net",
    "routerKey": "Key ol90ZWFkn3J0ZTN0ZTI4Ok5wT2h2dDJTeUFSanBDZzY0S01j",
    "botId": "botprincipal",
    "flowId": null,
    "blockId": null,
    "reset": false
}
```


#### *Identity* do contato
Retorna o *identity* do contato para ser usado na requisição anterior (/builder/change-user-state).

* **Method**: POST
* **Endpoint**: /contacts/get-user-identity
* **Body**:
```json
{
    "phone": "553199998888",
    "routerKey": "Key ol90ZWFkn3J0ZTN0ZTI4Ok5wT2h2dDJTeUFSanBDZzY0S01j"
}
```
* **Response**:
```json
{
    "status": 200,
    "message": "553199998888@wa.gw.msging.net"
}
```

### Tickets

Esse endpoint permite realizar o processo de criação, adição de tags e fechamento de ticket em apenas uma requisição.

```http
POST /tickets/create-ticket 
``` 
### Parâmetros do corpo da requisição
| Parâmetros   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `customerIdentity` | `string` | **Obrigatório**. Identitidade do usuário. |
| `tags` | `[string]` | **Obrigatório**. Lista de tags para o ticket |
| `closeTicket` | `boolean` | **Obrigatório**. valor para indicar se o ticket será fechado ao final |
| `closeStatus` | `string` | Status de fechamento, sendo possível fechamentos pelo usuário e atendente   |

### Headers:
```bash
     Content-Type: application/json
     Authorization: <bot_key>
```

### Resposta:


| Parâmetros   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `message` | `string` | **Obrigatório**. Mensagem sobre o resultado da requisição |
| `data` | `object` | **Obrigatório**. Objeto de resposta com as informações do ticket|
        
### Exemplo de requisição:

```bash
    method: "POST"
    headers: {
        "Content-Type": "application/json"
        "Authorization": "Key dHJlaW5hbWVudG9hdGVuZGltZW50bzE6Y24yOXV1T3dsdU5TSTVVY3lEeTE="
    }
    data: {
        "customerIdentity": "6b0b7c5a-b919-4466-81b8-b768e7370503@tunnel.msging.net"
        "tags": ["tag1", "tag2"],
        "closeTicket": true,
        "closeStatus": "attendant"
    }
   
```


### Replies

#### Resposta Pronta

Esse endpoint vai permiter a busca de qualquer resposta pronta baseado na sua categoria e título, caso não sejam encontradas respostas prontas que correspondam ao título informado serão devolvidas todas as mensagens da categoria.

Vale lembrar que o uso desse recurso fora do blip desk não permite que as variáveis do desk sejam reconhecidas. Ou seja, se você tiver uma mensagem contendo "{{agent.fullName}}" o valor da variável não será definida.

```http
POST /replies/get-custom-reply 
``` 
### Parâmetros do corpo da requisição
| Parâmetros   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `categoryName` | `string` | **Obrigatório**. Nome da categoria de respostas |
| `title` | `string` | **Obrigatório**. título da mensagem pronta que deseja |


### Headers:
```bash
     Content-Type: application/json
     Authorization: <bot_key>
```

### Resposta:


| Parâmetros   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `message` | `string` | **Obrigatório**. Mensagem sobre o resultado da requisição |
| `data` | `object` | **Obrigatório**. Objeto de resposta com as informações da(s) resposta(s) pronta(s)|
        
### Exemplo de requisição:

```bash
    method: "POST"
    headers: {
        "Content-Type": "application/json"
        "Authorization": "Key dHJlaW5hbWVudG9hdGVuZGltZW50bzE6Y24yOXV1T3dsdU5TSTVVY3lEeTE="
    }
    data: {
        "categoryName": "onboarding"
        "title": "boasvindas",
    }
   
```


### Attendance Queues

#### Filas de atendimento específicas para cada agente

```http
POST /attendance/create-an-attendance-queue-foreach-agent 
``` 

### Parâmetros do corpo da requisição
| Parâmetros   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `agents` | `[string]` | **Obrigatório**. Lista com os emails de cada agente |
| `ownerIdentity` | `string` | **Obrigatório**. Corresponde ao "id" do bot em questão + @msing.net |

Se informarmos agents como uma lista vazia, ele irá considerar os agentes cadastrados na área de atendimento

### Headers:
```bash
     Content-Type: application/json
     Authorization: <bot_key>
```

### Resposta:


| Parâmetros   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `message` | `string` | **Obrigatório**. Mensagem sobre o resultado da requisição |
| `data` | `object` | **Obrigatório**. Objeto de resposta com as informações sobre a criação das filas|
        

### Exemplo de requisição:

```bash
    method: "POST"
    headers: {
        "Content-Type": "application/json"
        "Authorization": "Key dHJlaW5hbWVudG9hdGVuZGltZW50bzE6Y24yOXV1T3dsdU5TSTVVY3lEeTE="
    }
    data: {
        "agents": []
        "ownerIdentity": "bottreinamento1@msging.net",
    }
   
```


## Versao Node.js

```sh
v16.1.0
```
