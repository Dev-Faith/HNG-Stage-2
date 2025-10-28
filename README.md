# 🌍 Country Data API

A robust RESTful API built with NestJS that fetches country data from external APIs, calculates estimated GDP, stores data in MySQL, and provides comprehensive CRUD operations with advanced filtering.

## 🚀 Features

- **🌐 External API Integration** - Fetches real-time data from REST Countries and Exchange Rate APIs
- **💾 Database Storage** - MySQL with TypeORM for data persistence
- **📊 GDP Calculation** - Complex formula: `population × random(1000–2000) ÷ exchange_rate`
- **🔍 Advanced Filtering** - Filter by region, currency, and sort by GDP/population
- **🖼️ Image Generation** - Automatic summary PNG with top 5 countries by GDP
- **🛡️ Error Handling** - Comprehensive validation and proper HTTP status codes
- **📈 Real-time Data** - Refresh endpoint to update all country data

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: MySQL with TypeORM
- **External APIs**: REST Countries API, Open Exchange Rates API
- **Image Generation**: Canvas
- **Validation**: Class Validator
- **Containerization**: Docker & Docker Compose

## 📋 API Endpoints

| Method   | Endpoint             | Description                                                     |
| -------- | -------------------- | --------------------------------------------------------------- |
| `GET`    | `/status`            | Get total countries count and last refresh timestamp            |
| `POST`   | `/countries/refresh` | Fetch latest data from external APIs and generate summary image |
| `GET`    | `/countries`         | Get all countries (supports filtering and sorting)              |
| `GET`    | `/countries/:name`   | Get specific country by name                                    |
| `DELETE` | `/countries/:name`   | Delete country record                                           |
| `GET`    | `/countries/image`   | Get generated summary image (PNG)                               |
| `GET`    | `/countries/summary` | Get HTML summary page                                           |

### 🔧 Query Parameters for `/countries`

- `region` - Filter by region (e.g., `Africa`, `Europe`)
- `currency` - Filter by currency code (e.g., `USD`, `EUR`)
- `sort` - Sort results (`gdp_desc`, `gdp_asc`, `population_desc`, `population_asc`)

### 📝 Examples

```bash
# Get all African countries sorted by GDP (descending)
GET /countries?region=Africa&sort=gdp_desc

# Get countries using USD currency
GET /countries?currency=USD

# Get specific country
GET /countries/Nigeria
```

## 🏗️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MySQL (or Docker)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd country-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start MySQL with Docker Compose
docker-compose up -d
```

#### Option B: Using Local MySQL

```bash
# Create database manually
mysql -u root -p -e "CREATE DATABASE country_api;"
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_NAME=country_api
NODE_ENV=development
PORT=3000
```

### 5. Start the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production build
npm run build
npm run start
```

## 🐳 Docker Compose

The project includes `docker-compose.yml` for easy database setup:

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: country_api
      MYSQL_USER: app_user
      MYSQL_PASSWORD: password
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql
```

## 📊 Data Model

### Country Entity

| Field               | Type   | Description                     |
| ------------------- | ------ | ------------------------------- |
| `id`                | number | Auto-generated primary key      |
| `name`              | string | Country name (required)         |
| `capital`           | string | Capital city (optional)         |
| `region`            | string | Geographic region (optional)    |
| `population`        | number | Population count (required)     |
| `currency_code`     | string | Currency code (required)        |
| `exchange_rate`     | number | Exchange rate to USD (required) |
| `estimated_gdp`     | number | Computed GDP estimate           |
| `flag_url`          | string | URL to country flag (optional)  |
| `last_refreshed_at` | Date   | Auto timestamp                  |

### GDP Calculation Formula

```
estimated_gdp = population × random(1000–2000) ÷ exchange_rate
```

## 🧪 Testing the API

### Using Thunder Client (VS Code Extension)

1. Install Thunder Client from VS Code extensions
2. Import the provided collection or create requests manually
3. Test endpoints in this sequence:

```bash
# 1. Check initial status
GET http://localhost:3000/status

# 2. Refresh data (takes 10-30 seconds)
POST http://localhost:3000/countries/refresh

# 3. Verify data loaded
GET http://localhost:3000/status

# 4. Test filters
GET http://localhost:3000/countries?region=Africa&sort=gdp_desc

# 5. View summary image
GET http://localhost:3000/countries/image
```

### Using curl

```bash
# Refresh data
curl -X POST http://localhost:3000/countries/refresh

# Get all countries
curl http://localhost:3000/countries

# Download summary image
curl http://localhost:3000/countries/image --output summary.png
```

## 🔄 Refresh Behavior

- Fetches data from:
  - `https://restcountries.com/v3.1/all`
  - `https://open.er-api.com/v6/latest/USD`
- Handles multiple currencies (uses first currency code)
- Updates existing countries or inserts new ones
- Recalculates GDP with fresh random multiplier
- Generates new summary image

## 🚨 Error Handling

| Status Code | Response Format                                    |
| ----------- | -------------------------------------------------- |
| `400`       | `{"error": "Validation failed", "details": {...}}` |
| `404`       | `{"error": "Country not found"}`                   |
| `503`       | `{"error": "External data source unavailable"}`    |
| `500`       | `{"error": "Internal server error"}`               |

## 📁 Project Structure

```
src/
├── countries/
│   ├── entities/country.entity.ts
│   ├── dto/create-country.dto.ts
│   ├── services/
│   │   ├── countries.service.ts
│   │   ├── external-api.service.ts
│   │   └── image-generator.service.ts
│   ├── controllers/countries.controller.ts
│   └── countries.module.ts
├── common/
│   └── status.controller.ts
└── app.module.ts
```

## 🛠️ Development

```bash
# Development with watch mode
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run tests
npm test
```

## 🌐 External APIs Used

- **REST Countries API**: `https://restcountries.com/v3.1/all`
- **Open Exchange Rates API**: `https://open.er-api.com/v6/latest/USD`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- REST Countries API for comprehensive country data
- Open Exchange Rates API for currency data
- NestJS team for the excellent framework
- Thunder Client for API testing

---

<div align="center">

**🚀 Happy Coding!**

For questions or support, please open an issue in the repository.

</div>

## 📞 Support

If you have any questions or run into issues, please:

1. Check the [Issues](https://github.com/yourusername/country-api/issues) page
2. Create a new issue with detailed description
3. Provide steps to reproduce if it's a bug

---

_Last updated: October 2025_

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
