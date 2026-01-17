import { where, Op } from "sequelize";
import db from "../models/index.js"
import bcrypt from "bcrypt";
// Bycrypt
// register: password(password123) -> hashed password (jqwdk213#@) 
// login: password(wrongpasswrod) -> compare(hasedPassword,password)

const createUserService = async (userData) =>{
    try{
       if(!userData.userName || !userData.phoneNumber || !userData.password ){
        return {
            EC:-1,
            EM:'Missing parameter!',
            DT:''
        };
       }

       let isValid2 = await validatePhase2(userData.userName,userData.phoneNumber);
       
       if(isValid2 === false) {
        return {
            EC:-1,
            EM:'UserName or phoneNumber is exist!',
            DT:''
        };
       }
       

        const saltRounds = 10;
        const password = userData.password;
     

        let hashPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(password, saltRounds, function (err, hash) {
                if (err) reject(err)
                resolve(hash)
            });
        });

        const data ={
            phoneNumber: userData.phoneNumber,
            password:hashPassword,
            userName:userData.userName
        }

        await db.User.create(data);

       
        return {
            EC:0,
            EM:'Done',
            DT:''
        };
    }
    catch(e){
        console.log(e);
    }

}

const validatePhase2 = async ( userName, phoneNumber) => {
    let result = true;

    let userValid1 = await db.User.findOne(
        {
            where: {userName:userName},
           
        },);
    
    let userValid2 = await db.User.findOne(
        {where: {phoneNumber:phoneNumber}}
        );
    if((userValid1 && userValid1.userName) || ( userValid2 && userValid2.userName)){
        result = false;
    }
    return result;
}

// Async + await : controller/service, all queries
// try + catch


const getUserService =async (id) =>{
    try{
       let user= await db.User.findOne(id);
        return {
            EC:0,
            EM:'Done',
            DT:user,
        };
    }
    catch(e){
        console.log(e);
    }

}

const loginUserService = async (userData) => {
    try {
        if (!userData.phoneNumber || !userData.password) {
            return {
                EC: -1,
                EM: 'Missing parameter!',
                DT: ''
            };
        }

        // Try to find manager first
        let manager = await db.Manager.findOne({
            where: { phoneNumber: userData.phoneNumber }
        });

        if (manager) {
            // Compare password for manager
            let isPasswordValid = await new Promise((resolve, reject) => {
                bcrypt.compare(userData.password, manager.password, function (err, result) {
                    if (err) reject(err);
                    resolve(result);
                });
            });

            if (!isPasswordValid) {
                return {
                    EC: -1,
                    EM: 'Password is incorrect!',
                    DT: ''
                };
            }

            return {
                EC: 0,
                EM: 'Login successful!',
                DT: {
                    id: manager.id,
                    userName: manager.userName,
                    phoneNumber: manager.phoneNumber,
                    role: 'manager'
                }
            };
        }

        // Find user by phone number
        let user = await db.User.findOne({
            where: { phoneNumber: userData.phoneNumber }
        });

        if (!user) {
            return {
                EC: -1,
                EM: 'Phone number not found!',
                DT: ''
            };
        }

        // Compare password for user
        let isPasswordValid = await new Promise((resolve, reject) => {
            bcrypt.compare(userData.password, user.password, function (err, result) {
                if (err) reject(err);
                resolve(result);
            });
        });

        if (!isPasswordValid) {
            return {
                EC: -1,
                EM: 'Password is incorrect!',
                DT: ''
            };
        }

        return {
            EC: 0,
            EM: 'Login successful!',
            DT: {
                id: user.id,
                userName: user.userName,
                phoneNumber: user.phoneNumber,
                role: user.role || 'user'
            }
        };
    } catch (e) {
        console.log(e);
        return {
            EC: -1,
            EM: 'Error from backend!',
            DT: ''
        };
    }
}

const getShippingAddressesService = async (userId) => {
  try {
    const addresses = await db.ShippingInf.findAll({
      where: { userId: userId },
      order: [['createdAt', 'DESC']]
    });

    return {
      EC: 0,
      EM: 'Success',
      DT: addresses
    };
  } catch (error) {
    console.log(error);
    return {
      EC: -1,
      EM: 'Error fetching addresses',
      DT: ''
    };
  }
};

const createShippingAddressService = async (userId, data) => {
  try {
    if (!data.fullName || !data.phoneNumber || !data.address) {
      return {
        EC: -1,
        EM: 'Missing required fields',
        DT: ''
      };
    }

    const existingAddresses = await db.ShippingInf.count({ where: { userId: userId } });
    const isDefault = existingAddresses === 0;

    const newAddress = await db.ShippingInf.create({
      userId: userId,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      address: data.address,
      isDefault: isDefault
    });

    return {
      EC: 0,
      EM: 'Address created successfully',
      DT: newAddress
    };
    } catch (error) {
    console.log("Create address error:", error?.message);
    console.log("Sequelize details:", error?.errors);
    return {
      EC: -1,
      EM: error?.message || "Error creating address",
      DT: error?.errors || ""
    };
  }
};

const updateShippingAddressService = async (userId, addressId, data) => {
  try {
    if (!data.fullName || !data.phoneNumber || !data.address) {
      return {
        EC: -1,
        EM: 'Missing required fields',
        DT: ''
      };
    }

    const address = await db.ShippingInf.findOne({
      where: { id: addressId, userId: userId }
    });

    if (!address) {
      return {
        EC: -1,
        EM: 'Address not found',
        DT: ''
      };
    }

    await address.update({
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      address: data.address
    });

    return {
      EC: 0,
      EM: 'Address updated successfully',
      DT: address
    };
  } catch (error) {
    console.log(error);
    return {
      EC: -1,
      EM: 'Error updating address',
      DT: ''
    };
  }
};

const deleteShippingAddressService = async (userId, addressId) => {
  try {
    const address = await db.ShippingInf.findOne({
      where: { id: addressId, userId: userId }
    });

    if (!address) {
      return {
        EC: -1,
        EM: 'Address not found',
        DT: ''
      };
    }

    const wasDefault = address.isDefault;

    await address.destroy();

    if (wasDefault) {
      const firstAddress = await db.ShippingInf.findOne({
        where: { userId: userId },
        order: [['createdAt', 'ASC']]
      });

      if (firstAddress) {
        await firstAddress.update({ isDefault: true });
      }
    }

    return {
      EC: 0,
      EM: 'Address deleted successfully',
      DT: ''
    };
  } catch (error) {
    console.log(error);
    return {
      EC: -1,
      EM: 'Error deleting address',
      DT: ''
    };
  }
};

const setDefaultAddressService = async (userId, addressId) => {
  try {
    const address = await db.ShippingInf.findOne({
      where: { id: addressId, userId: userId }
    });

    if (!address) {
      return {
        EC: -1,
        EM: 'Address not found',
        DT: ''
      };
    }

    await db.ShippingInf.update(
      { isDefault: false },
      { where: { userId: userId } }
    );

    await address.update({ isDefault: true });

    return {
      EC: 0,
      EM: 'Default address set successfully',
      DT: address
    };
  } catch (error) {
    console.log(error);
    return {
      EC: -1,
      EM: 'Error setting default address',
      DT: ''
    };
  }
};

const changePasswordService = async (userId, data) => {
  try {
    if (!data.oldPassword || !data.newPassword) {
      return {
        EC: -1,
        EM: 'Missing required fields',
        DT: ''
      };
    }

    // Find user
    const user = await db.User.findByPk(userId);
    if (!user) {
      return {
        EC: -1,
        EM: 'User not found',
        DT: ''
      };
    }

    // Compare old password
    const isPasswordValid = await new Promise((resolve, reject) => {
      bcrypt.compare(data.oldPassword, user.password, function (err, result) {
        if (err) reject(err);
        resolve(result);
      });
    });

    if (!isPasswordValid) {
      return {
        EC: -1,
        EM: 'Old password is incorrect',
        DT: ''
      };
    }

    // Hash new password
    const saltRounds = 10;
    const newHashPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(data.newPassword, saltRounds, function (err, hash) {
        if (err) reject(err);
        resolve(hash);
      });
    });

    // Update password
    await user.update({ password: newHashPassword });

    return {
      EC: 0,
      EM: 'Password changed successfully',
      DT: ''
    };
  } catch (error) {
    console.log(error);
    return {
      EC: -1,
      EM: 'Error changing password',
      DT: ''
    };
  }
};

const getUserInfoService = async (userId) => {
  try {
    const user = await db.User.findByPk(userId, {
      attributes: ['id', 'userName', 'phoneNumber', 'createdAt']
    });

    if (!user) {
      return {
        EC: -1,
        EM: 'User not found',
        DT: ''
      };
    }

    return {
      EC: 0,
      EM: 'Success',
      DT: user
    };
  } catch (error) {
    console.log(error);
    return {
      EC: -1,
      EM: 'Error fetching user info',
      DT: ''
    };
  }
};

const updateUserInfoService = async (userId, data) => {
  try {
    if (!data.userName || !data.phoneNumber) {
      return {
        EC: -1,
        EM: 'Missing required fields',
        DT: ''
      };
    }

    // Check if phone number already exists (for other users)
    const existingUser = await db.User.findOne({
      where: { 
        phoneNumber: data.phoneNumber,
        id: { [Op.ne]: userId }
      }
    });

    if (existingUser) {
      return {
        EC: -1,
        EM: 'Phone number already exists',
        DT: ''
      };
    }

    const user = await db.User.findByPk(userId);
    if (!user) {
      return {
        EC: -1,
        EM: 'User not found',
        DT: ''
      };
    }

    await user.update({
      userName: data.userName,
      phoneNumber: data.phoneNumber
    });

    return {
      EC: 0,
      EM: 'User information updated successfully',
      DT: user
    };
  } catch (error) {
    console.log(error);
    return {
      EC: -1,
      EM: 'Error updating user info',
      DT: ''
    };
  }
};

// export { 
//   createUserService, 
//   validatePhase2,
//   getUserService, 
//   loginUserService,
//   getShippingAddressesService,
//   createShippingAddressService,
//   updateShippingAddressService,
//   deleteShippingAddressService,
//   setDefaultAddressService,
//   changePasswordService
// };

export default {
  createUserService,
  validatePhase2,
  getUserService,
  loginUserService,
  getShippingAddressesService,
  createShippingAddressService,
  updateShippingAddressService,
  deleteShippingAddressService,
  setDefaultAddressService,
  changePasswordService,
  getUserInfoService,
  updateUserInfoService
};