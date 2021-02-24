# eCommerce/NodeJS-MongoDB
Current Version of API : v1  
Postman collection URL: https://documenter.getpostman.com/view/14701165/TWDajued
## Technology / Tools
- NodeJs
- ExpressJS
- TypeScript
- Jest
- MongoDB
- Mongoose
- TypeGoose
- JWT
- cron-node


## Installation

Use the package manager [npm](https://www.npmjs.com/) to install the application.

```bash
# to install all dependency
npm install

# to start the application
npm start

# to run the sample testcase
npm test
```
## Endpoints
```
# Endpoint Prefix: /api/currentVersion/
POST /api/v1/Users
```
### USERS ###
```bash
POST    /api/v1/Users  # Create new user
PUT     /api/v1/Users  # Update user
PATCH   /api/v1/Users  # Update user balance
DELETE  /api/v1/Users  # Delete user
POST    /api/v1/Login  # Validate user credentials
```
### Stores ###
```bash
POST    /api/v1/Stores                   # Create new store
PUT     /api/v1/Stores/:id               # Update store
GET     /api/v1/Stores?[q=name&page=0]   # Get all stores
GET     /api/v1/Stores/:id               # Get store with given id
DELETE  /api/v1/Stores/:id               # Delete store with given id
```
### Items ###
```bash
POST    /api/v1/Items                   # Create new item
PUT     /api/v1/Items/:id               # Update item

# Get all items with the given name from particular store
GET     /api/v1/Items?[q=name&page=0]&storeId=id   

GET     /api/v1/Items/:id               # Get item with given id
DELETE  /api/v1/Items/:id               # Delete item with given id
```
### Order ###
```bash
POST    /api/v1/Orders                  # Place a new order
DELETE  /api/v1/Orders/Items/:id        # Delete all the order for a given id
DELETE  /api/v1/Orders/:id              # Delete order with given id
```

## Permission
- Create User (Anyone)
- Create Store (Register User)
- Create Item (Store owner)
- List Store (Anyone)
- List Item (Anyone)
- Update Account (User)
- Update Store (Store owner)
- Update Item (Store owner)
- Delete Account (User)
- Delete Store (Store owner)
- Delete Item (Store owner)
- Place order (User)
- Delete order (User)
- Delete all order for an item (Store owner)


## License
[MIT](https://choosealicense.com/licenses/mit/)
