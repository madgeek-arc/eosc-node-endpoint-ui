<div align="center">
  <img src='https://eosc.eu/wp-content/uploads/2024/02/EOSC-Beyond-logo.png'></img>
</div>

# Node Endpoints Service (Front-End)

## Description

The **Node Endpoints Service (Front-End)** allows you to register and update your node's capabilities through a web interface.
The information is stored in a `capabilities.json` file at your chosen location.

You do **not** need to pre-create this file — it will be created automatically the first time you register capabilities.

---

## Prerequisites

* Angular 20
* Node.js 20

---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/madgeek-arc/eosc-node-endpoint-ui.git
cd eosc-node-endpoint-ui
npm install
```

---

## Running the Front-End

Start the development server with:

```bash
npm run start
```

The front-end will typically run on:
`http://localhost:4200`

---

## Configuration

If you need to connect the front-end to a different back-end URL, modify the environment configuration in:

```
src/environments/environment.ts
```
