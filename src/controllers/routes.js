import { Router } from 'express';
import { homePage } from './index.js';
import {
    buildRegister,
    buildLogin,
    registerAccountHandler,
    loginAccountHandler,
    logoutAccountHandler,
} from './account-controller.js';
import { registrationRules, checkRegData, loginRules, checkLoginData } from '../utils/account-validation.js';

const router = Router();
router.get('/', homePage);

router.get('/register', buildRegister);
router.post('/register', registrationRules(), checkRegData, registerAccountHandler);
router.get('/login', buildLogin);
router.post('/login', loginRules(), checkLoginData, loginAccountHandler);
router.get('/logout', logoutAccountHandler);

export default router;0