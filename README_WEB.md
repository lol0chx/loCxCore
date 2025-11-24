# 🍕 PizzaPoint Web Application

A full-stack pizza ordering application built with Spring Boot (backend) and React (frontend).

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

1. **Java Development Kit (JDK) 17 or higher**
   - Download from: https://www.oracle.com/java/technologies/downloads/
   - Verify installation: `java -version`

2. **Maven** (usually comes with modern Java installations)
   - Verify installation: `mvn -version`

3. **Node.js and npm** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node -v` and `npm -v`

## 🚀 How to Run the Application

### Step 1: Set Up and Run the Backend (Spring Boot)

1. Open a terminal/command prompt in the project root directory

2. Clean and build the project:
   ```powershell
   mvn clean install
   ```

3. Run the Spring Boot application:
   ```powershell
   mvn spring-boot:run
   ```

   **Or** run the Main.java file directly from your IDE (IntelliJ IDEA, Eclipse, VS Code)

4. The backend will start on **http://localhost:8080**

5. You can verify the backend is running by visiting:
   - API endpoint: http://localhost:8080/api/orders
   - H2 Database Console: http://localhost:8080/h2-console
     - JDBC URL: `jdbc:h2:mem:pizzadb`
     - Username: `sa`
     - Password: (leave empty)

### Step 2: Set Up and Run the Frontend (React)

1. Open a **NEW** terminal/command prompt

2. Navigate to the frontend directory:
   ```powershell
   cd frontend
   ```

3. Install dependencies (first time only):
   ```powershell
   npm install
   ```

4. Start the React development server:
   ```powershell
   npm run dev
   ```

5. The frontend will start on **http://localhost:5173** and should automatically open in your browser

### Step 3: Use the Application

Once both servers are running:

1. **Home Page**: Navigate to http://localhost:5173
   - View the welcome page with options to create orders or view the ledger

2. **Create New Order**:
   - Enter your name
   - Customize your pizza (size, crust, sauce, cheese, toppings)
   - Add items to cart
   - Submit the order

3. **View Ledger**:
   - See all previous orders
   - View order details
   - Delete orders

## 🛠️ Project Structure

```
project-root/
├── src/main/java/com/loCxCore/          # Backend (Spring Boot)
│   ├── Main.java                        # Spring Boot Application Entry Point
│   ├── controller/                      # REST API Controllers
│   │   ├── OrderController.java
│   │   └── MenuController.java
│   ├── service/                         # Business Logic Layer
│   │   ├── OrderService.java
│   │   └── PriceCalculatorService.java
│   ├── repository/                      # Database Access Layer
│   │   └── OrderRepository.java
│   ├── orders/                          # Order Models
│   │   └── Order.java
│   ├── menu/                            # Menu Items
│   │   ├── MenuItem.java
│   │   ├── pizza/
│   │   └── drink/
│   └── config/                          # Configuration
│       └── CorsConfig.java
├── src/main/resources/
│   └── application.properties           # Application Configuration
├── frontend/                            # Frontend (React)
│   ├── src/
│   │   ├── components/                  # React Components
│   │   │   ├── Home.jsx
│   │   │   ├── NewOrder.jsx
│   │   │   └── Ledger.jsx
│   │   ├── services/                    # API Service
│   │   │   └── api.js
│   │   ├── App.jsx                      # Main App Component
│   │   └── main.jsx                     # Entry Point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── pom.xml                              # Maven Configuration
```

## 🔧 API Endpoints

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/customer/{name}` - Get orders by customer name
- `DELETE /api/orders/{id}` - Delete an order
- `PUT /api/orders/{id}/status` - Update order status

### Menu
- `GET /api/menu/pizza-sizes` - Get available pizza sizes
- `GET /api/menu/crust-types` - Get available crust types
- `GET /api/menu/cheese-types` - Get available cheese types
- `GET /api/menu/sauce-types` - Get available sauce types
- `GET /api/menu/drink-sizes` - Get available drink sizes

## 🐛 Troubleshooting

### Backend Issues

1. **Port 8080 already in use**:
   - Change the port in `application.properties`: `server.port=8081`
   - Update the API URL in `frontend/src/services/api.js`

2. **Maven build fails**:
   - Run: `mvn clean install -U` (forces update of dependencies)
   - Check your Java version: `java -version` (needs Java 17+)

3. **Database connection errors**:
   - The H2 in-memory database is automatically configured
   - Check `application.properties` for correct configuration

### Frontend Issues

1. **Port 5173 already in use**:
   - The app will automatically try another port
   - Or change it in `vite.config.js`

2. **Cannot connect to backend**:
   - Ensure backend is running on http://localhost:8080
   - Check browser console for CORS errors
   - Verify API_BASE_URL in `frontend/src/services/api.js`

3. **npm install fails**:
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and `package-lock.json`, then run `npm install` again

## 🎨 Technologies Used

### Backend
- **Spring Boot 3.2.0** - Application framework
- **Spring Data JPA** - Database access
- **H2 Database** - In-memory database
- **Maven** - Build tool

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **React Router** - Navigation

## 📝 Notes

- The database is in-memory, so all data will be lost when the backend stops
- To persist data, switch to a file-based H2 database or PostgreSQL/MySQL
- The application includes CORS configuration for local development
- Default credentials for H2 console: username=`sa`, password=(empty)

## 🎉 Features

- ✅ Create custom pizza orders
- ✅ Choose from multiple sizes, crusts, sauces, and cheeses
- ✅ Add unlimited toppings
- ✅ Shopping cart functionality
- ✅ View all orders in ledger
- ✅ Delete orders
- ✅ Responsive design
- ✅ Real-time price calculation

---

**Enjoy your PizzaPoint experience! 🍕**
