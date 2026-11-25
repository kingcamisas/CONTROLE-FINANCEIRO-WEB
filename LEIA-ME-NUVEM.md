# Salvar na nuvem (login por e-mail) — passo a passo

Leva uns 10 minutos e é grátis. Você só faz isso uma vez.
Depois, tudo o que você altera no app é salvo sozinho na sua conta,
e em qualquer celular/computador basta entrar com o mesmo e-mail e senha.

## 1. Criar o projeto no Firebase
1. Entre em https://console.firebase.google.com com sua conta Google.
2. **Criar projeto** → dê um nome (ex.: `controle-dividas`) → pode desligar o Google Analytics → **Criar**.

## 2. Ativar o login por e-mail
1. No menu da esquerda: **Build (Criação) → Authentication → Começar**.
2. Aba **Sign-in method** → **E-mail/senha** → ative a primeira opção → **Salvar**.

## 3. Criar o banco de dados
1. **Build → Firestore Database → Criar banco de dados**.
2. Escolha a região mais próxima (ex.: `southamerica-east1`, São Paulo) → modo **produção** → **Criar**.
3. Aba **Regras** → apague tudo e cole o texto abaixo → **Publicar**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
Essas regras garantem que cada pessoa só lê e grava os próprios dados.

## 4. Pegar os dados do projeto
1. Engrenagem ao lado de "Visão geral do projeto" → **Configurações do projeto**.
2. Role até **Seus apps** → ícone **</>** (Web) → dê um apelido → **Registrar app**.
3. Vai aparecer um bloco `firebaseConfig = { ... }`. Copie os valores de
   `apiKey`, `authDomain`, `projectId` e `appId`.

## 5. Colar no app
Abra o arquivo `firebase-config.js` e preencha:

```js
window.FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  appId: "1:123...:web:abc..."
};
```
Envie para o Netlify junto com os outros arquivos (index.html, style.css, app.js).

## 6. Usar
1. No app, toque no ícone de **pessoa** (canto superior direito).
2. Digite seu e-mail e uma senha → **Criar conta**.
3. Seus dados atuais sobem para a conta. Pronto: o texto embaixo do título passa a mostrar **"Salvo na sua conta"**.
4. Em outro aparelho: ícone de pessoa → mesmo e-mail e senha → **Entrar**.

### Bom saber
- Esqueceu a senha? Na tela de login digite o e-mail e toque em **Esqueci a senha**.
- Se entrar num aparelho que já tinha dados próprios, eles são **juntados** com os da conta (nada é perdido).
- Sem internet, o app continua funcionando e envia as alterações quando a conexão voltar.
- Ao tocar em **Sair**, os dados são apagados daquele aparelho (continuam na conta).
- Continue usando o **Backup** de vez em quando: é uma cópia extra, em arquivo, que fica com você.
- A chave `apiKey` do Firebase pode ficar pública no site; quem protege seus dados são as regras do passo 3.
