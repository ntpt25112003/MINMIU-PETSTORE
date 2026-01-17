
// frontend -> backend -> database 

//B1: Database 
// Create migration (Users, products,...) : Để tạo bảng mới trong database
// Create model (Users, products,...) : Để tương tác với bảng

//B2: API (/api/user) POST, PUT, GET, DELETE -> trỏ đến controller

// params /api/user?id=5 (DELETE)
// path /api/user/5


//B3: Create controller: kèm path/params/body
//B4: Create Service : Thực hiện chức năng ( Sử dụng sequelize, User.create(), User.delete() )

//Testing: postman/frontend 
