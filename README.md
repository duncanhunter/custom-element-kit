# Custom Element Kit

Welcome to the Custom Element Kit! This project provides a collection of web components.

## Features

- **Vanilla Javascript**: This project is built with vanilla JavaScript and does not require any build steps. Simply include the scripts in your HTML and start using the custom elements. There are minimal wrappers or custom helpers just standard web components. There is a build step to generate the docs, minify the custom elements and pre render the components to declarative shadow dom, but they will run unoptimised as is in the browser.
- **Performant**: Small file size per a component generally 1-2kb gzipped and server rendered.
- **Accessible**: All custom elements are designed with accessibility in mind.
- **Declarative Shadow DOM**: Javascript utilities to convert to declarative shadow dom for server rendering.
- **Tested**: Each custom element is well tested.
- **Customizable**: Easily customize the appearance and behavior of the custom elements to fit your needs.

## Getting Started

To get started with the Custom Element Kit, follow these steps:

1. **Clone the repository**:
   ```sh
   git clone https://github.com/your-username/custom-element-kit.git
   cd custom-element-kit
   ```

2. Install dependecies
   ```sh
   npm install
   ```

3. Build the project
   ```sh
   npm run build
   ``` 

4. Serve the project
   ```sh
   npm run serve:prod
   ``` 

5. Open your browser and navigate to http://localhost:8080 to see the custom elements in action.