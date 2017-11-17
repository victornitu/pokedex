# Pokedex User Interface

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

## Requirements

- **Docker** or **Node 8**

## To Notice

In **development**: UI targets pokeapi at `pokeapi.co`

In **production**: UI targets pokeapi at `localhost:8000`

To adjust those settings, update `.env` files

## Commands

### Docker

Build:
```
docker build -t pokedex-ui .
```

Start:
```
docker run --name app-ui -d -p 5000:5000 pokedex-ui
```

_Runs in pord by default, don't forget to launch the `pokeapi`_

### Node 8

|          | npm           | yarn       | env  |
|----------|:--------------|:-----------|------|
| install  | npm i         | yarn       |      |
| test     | npm test      | yarn test  | test |
| start    | npm start     | yarn start | dev  |
| build    | npm run build | yarn build | prod |
| serve    | npx serve -s build         | prod |

## Known Issues

If you have CORS issues, install the following extension in Chrome:
[Allow-Control-Allow-Origin: *](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi)
