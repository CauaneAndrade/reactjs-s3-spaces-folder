# reactjs-s3-spaces-folder
![App até o momento](./progresso.PNG)

## Stack
- Reactjs
- Nodejs
- MongoDB

### libs backend
...

## How to
1. criar arquivo `.env` e alterá-lo conforme o `env-sample`
2. Subir o mongoDB
    - estou usando através do docker
    - a ideia é usar container para toda a aplicação

Baixar a imagem, é oficial no dockerhub
```
docker pull mongo
```

Subir o banco. São essas credenciais usadas no `.env`
```
docker run -v ~/docker --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=user -e MONGO_INITDB_ROOT_PASSWORD=user mongo
```

3. Subir o backend
```
cd spaces-backend
npm run dev  # nodemon e logs no console
```

4. Subir frontend
você deve estar na pasta raíz.
preciso configurar as portas ainda, então vc receberá uma mensagem no terminal para acessar a aplicação em uma porta diferente da `3000`, apenas digite `y`
```
cd spaces-frontend
npm start
```

## notas
1. tem alguma coisa sobre ACL que preciso configurar no s3, as imagens estão bloqueadas para acesso. Não sei como resolver

2. não estou usando typescript ainda! a ideia é usar o template typescript