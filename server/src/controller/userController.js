import userService from "../service/userService.js";
import jwt from "jsonwebtoken";

const userRegisterController = async (req,res) =>{
    try {
       
        let result = await userService.createUserService(req.body);

        return res.status(200).json({
            EC:result.EC,
            EM:result.EM,
            DT:result.DT
        })


    } catch (error) {
        console.log(error);
        return res.status(200).json({
            EC:-1,
            EM:"Error from backend!",
            DT:""
        })
    }
}

const userLoginController = async (req, res) => {
  try {
    let result = await userService.loginUserService(req.body);

    // Nếu login fail -> trả luôn
    if (result.EC !== 0) {
      return res.status(200).json({
        EC: result.EC,
        EM: result.EM,
        DT: "",
      });
    }

    const payload = {
      id: result.DT.id,
      phoneNumber: result.DT.phoneNumber,
      role: result.DT.role || "user",
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      EC: 0,
      EM: result.EM,
      DT: {
        ...result.DT,
        accessToken,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: -1,
      EM: "Error from backend!",
      DT: "",
    });
  }
};

const getShippingAddressesController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userService.getShippingAddressesService(userId);
    
    return res.status(200).json({
      EC: result.EC,
      EM: result.EM,
      DT: result.DT
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: -1,
      EM: "Error from backend!",
      DT: ""
    });
  }
};

const createShippingAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userService.createShippingAddressService(userId, req.body);
    
    return res.status(200).json({
      EC: result.EC,
      EM: result.EM,
      DT: result.DT
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: -1,
      EM: "Error from backend!",
      DT: ""
    });
  }
};

const updateShippingAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const result = await userService.updateShippingAddressService(userId, addressId, req.body);
    
    return res.status(200).json({
      EC: result.EC,
      EM: result.EM,
      DT: result.DT
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: -1,
      EM: "Error from backend!",
      DT: ""
    });
  }
};

const deleteShippingAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const result = await userService.deleteShippingAddressService(userId, addressId);
    
    return res.status(200).json({
      EC: result.EC,
      EM: result.EM,
      DT: result.DT
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: -1,
      EM: "Error from backend!",
      DT: ""
    });
  }
};

const setDefaultAddressController = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const result = await userService.setDefaultAddressService(userId, addressId);
    
    return res.status(200).json({
      EC: result.EC,
      EM: result.EM,
      DT: result.DT
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: -1,
      EM: "Error from backend!",
      DT: ""
    });
  }
};

const changePasswordController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userService.changePasswordService(userId, req.body);
    
    return res.status(200).json({
      EC: result.EC,
      EM: result.EM,
      DT: result.DT
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: -1,
      EM: "Error from backend!",
      DT: ""
    });
  }
};

const getUserInfoController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userService.getUserInfoService(userId);
    
    return res.status(200).json({
      EC: result.EC,
      EM: result.EM,
      DT: result.DT
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: -1,
      EM: "Error from backend!",
      DT: ""
    });
  }
};

const updateUserInfoController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await userService.updateUserInfoService(userId, req.body);
    
    return res.status(200).json({
      EC: result.EC,
      EM: result.EM,
      DT: result.DT
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: -1,
      EM: "Error from backend!",
      DT: ""
    });
  }
};

export {
  userRegisterController,
  userLoginController,
  getShippingAddressesController,
  createShippingAddressController,
  updateShippingAddressController,
  deleteShippingAddressController,
  setDefaultAddressController,
  changePasswordController,
  getUserInfoController,
  updateUserInfoController
};

// Input -> function -> Output = return

// api -> controller -> service 
