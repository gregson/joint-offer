"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartphoneSyncWorker = void 0;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var SmartphoneSyncWorker = /** @class */ (function () {
    function SmartphoneSyncWorker() {
        this.CHUNK_SIZE = 100;
        this.DEFAULT_IMAGE_URL = 'https://joint-offer.com/images/default-smartphone.png';
        this.VOO_BASE_URL = 'https://www.voo.be';
        this.BRAND_MAPPINGS = {
            'samsung': 'Samsung',
            'apple': 'Apple',
            'google': 'Google',
            'oneplus': 'OnePlus',
            'fairphone': 'Fairphone',
            'xiaomi': 'Xiaomi'
        };
        this.configPath = path_1.default.join(__dirname, '../config/feedMappings.json');
        this.smartphonesPath = path_1.default.join(__dirname, '../data/smartphones.json');
        this.dataPath = path_1.default.join(__dirname, '../data/');
        this.transformers = {
            generateVooUrl: this.generateVooUrl.bind(this),
            price: this.transformPrice.bind(this),
            removeGoSuffix: this.removeGoSuffix.bind(this),
            normalizeString: this.normalizeString.bind(this),
            cleanModel: this.cleanModel.bind(this),
            extractStorage: this.extractStorage.bind(this)
        };
    }
    SmartphoneSyncWorker.prototype.loadConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var configContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, promises_1.default.readFile(this.configPath, 'utf-8')];
                    case 1:
                        configContent = _a.sent();
                        this.config = JSON.parse(configContent);
                        return [2 /*return*/];
                }
            });
        });
    };
    SmartphoneSyncWorker.prototype.normalizeString = function (str) {
        if (!str)
            return '';
        return str.trim().toLowerCase();
    };
    SmartphoneSyncWorker.prototype.normalizeBrand = function (brand) {
        var normalizedBrand = this.normalizeString(brand);
        return this.BRAND_MAPPINGS[normalizedBrand] || brand;
    };
    SmartphoneSyncWorker.prototype.cleanModel = function (model) {
        var cleanedModel = model.trim();
        // Remove brand name if it appears at the start
        Object.values(this.BRAND_MAPPINGS).forEach(function (brand) {
            if (cleanedModel.toLowerCase().startsWith(brand.toLowerCase())) {
                cleanedModel = cleanedModel.substring(brand.length).trim();
            }
        });
        // Remove storage information
        cleanedModel = cleanedModel.replace(/\s*\d+\s*(gb|go|tb)/i, '');
        // Remove network indicators if not part of the main model name
        if (cleanedModel.split(' ').length > 2) {
            cleanedModel = cleanedModel.replace(/\s*(5G|4G|LTE)\s*$/i, '');
        }
        // Remove color variations
        var colors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'gray', 'grey', 'gold', 'silver', 'titanium'];
        colors.forEach(function (color) {
            cleanedModel = cleanedModel.replace(new RegExp("\\s+".concat(color, "\\s*$"), 'i'), '');
        });
        return cleanedModel.trim();
    };
    SmartphoneSyncWorker.prototype.extractStorage = function (storage) {
        if (typeof storage === 'number')
            return storage;
        // Handle TB values
        if (storage.toString().toLowerCase().includes('tb')) {
            var match_1 = storage.toString().match(/(\d+)\s*TB/i);
            return match_1 ? parseInt(match_1[1], 10) * 1024 : 0;
        }
        // Handle GB values
        var match = storage.toString().match(/(\d+)\s*(GB|Go)/i);
        return match ? parseInt(match[1], 10) : 0;
    };
    SmartphoneSyncWorker.prototype.generateId = function (brand, model, storage) {
        // Remove any existing brand prefix from the model
        var cleanBrand = brand.toLowerCase();
        var cleanModel = model.toLowerCase();
        if (cleanModel.startsWith(cleanBrand)) {
            cleanModel = cleanModel.substring(cleanBrand.length).trim();
        }
        // Remove storage information from model
        cleanModel = cleanModel.replace(/\s*\d+\s*(gb|go|tb)/i, '');
        // Remove color information
        var colors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'gray', 'grey', 'gold', 'silver', 'titanium'];
        colors.forEach(function (color) {
            cleanModel = cleanModel.replace(new RegExp("\\s+".concat(color, "\\s*$"), 'i'), '');
        });
        // Generate the final ID
        return "".concat(cleanBrand, "-").concat(cleanModel.replace(/\s+/g, '-'), "-").concat(storage).toLowerCase();
    };
    SmartphoneSyncWorker.prototype.generateVooUrl = function (item) {
        if (typeof item === 'string')
            return '';
        return "".concat(this.VOO_BASE_URL, "/fr/b2c/mobile/smartphones/").concat(item.code);
    };
    SmartphoneSyncWorker.prototype.transformPrice = function (value) {
        if (typeof value === 'number')
            return Math.round(value);
        if (typeof value === 'string') {
            var match = value.match(/\d+([.,]\d+)?/);
            if (match) {
                return Math.round(parseFloat(match[0].replace(',', '.')));
            }
        }
        return 0;
    };
    SmartphoneSyncWorker.prototype.removeGoSuffix = function (value) {
        return value.replace(/\s*go\s*$/i, '');
    };
    SmartphoneSyncWorker.prototype.extractDataFromProvider = function (provider, rawData) {
        if (provider === 'proximus') {
            return rawData;
        }
        else if (provider === 'voo') {
            return rawData.smartphones || [];
        }
        else if (provider === 'orange') {
            return (rawData.results && rawData.results[0] && rawData.results[0].hits) || [];
        }
        return [];
    };
    SmartphoneSyncWorker.prototype.processProviderData = function (provider, data) {
        return __awaiter(this, void 0, void 0, function () {
            var mapping, smartphones, _i, data_1, item, brand, model, storage, id, imageUrl, upfrontPrice, existingPhone, smartphone;
            var _a;
            return __generator(this, function (_b) {
                mapping = this.config.providers[provider].fieldMappings;
                smartphones = new Map();
                for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                    item = data_1[_i];
                    try {
                        brand = this.normalizeBrand(this.extractValue(item, mapping.brand));
                        model = this.cleanModel(this.extractValue(item, mapping.model));
                        storage = this.extractStorage(this.extractValue(item, mapping.storage));
                        if (!brand || !model || !storage) {
                            console.log("Skipping item due to missing required fields:", {
                                provider: provider,
                                brand: brand,
                                model: model,
                                storage: storage,
                                raw: JSON.stringify(item)
                            });
                            continue;
                        }
                        id = this.generateId(brand, model, storage);
                        imageUrl = provider === 'proximus' ? (item.image_link || '') : '';
                        upfrontPrice = {
                            price: this.transformPrice(item.price_jo || item.basePrice || item.priceRecurringInitial || 0),
                            condition: this.extractCondition(provider, item),
                            url: this.extractUrl(provider, item)
                        };
                        if (smartphones.has(id)) {
                            existingPhone = smartphones.get(id);
                            existingPhone.upfrontPrices[provider] = upfrontPrice;
                            if (!existingPhone.imageUrl && imageUrl) {
                                existingPhone.imageUrl = imageUrl;
                            }
                        }
                        else {
                            smartphone = {
                                id: id,
                                brand: brand,
                                model: model,
                                storage: storage,
                                imageUrl: imageUrl,
                                upfrontPrices: (_a = {},
                                    _a[provider] = upfrontPrice,
                                    _a)
                            };
                            smartphones.set(id, smartphone);
                        }
                    }
                    catch (error) {
                        console.error("Error processing item from ".concat(provider, ":"), error);
                    }
                }
                return [2 /*return*/, Array.from(smartphones.values())];
            });
        });
    };
    SmartphoneSyncWorker.prototype.extractCondition = function (provider, item) {
        switch (provider) {
            case 'proximus':
                if (item.dataOption && item.optionPrice) {
                    return "Avec ".concat(item.dataOption, " : \u20AC").concat(item.optionPrice, "/mois.");
                }
                return '';
            case 'voo':
                if (item.dataOption && item.optionPrice) {
                    return "Avec ".concat(item.dataOption, " pour ").concat(item.optionPrice, "\u20AC/mois");
                }
                return '';
            case 'orange':
                if (item.dataOption && item.optionPrice) {
                    return "Avec ".concat(item.dataOption, " pour ").concat(item.optionPrice, "\u20AC/mois");
                }
                return '';
            default:
                return '';
        }
    };
    SmartphoneSyncWorker.prototype.extractUrl = function (provider, item) {
        switch (provider) {
            case 'proximus':
                if (item.productCode) {
                    return "https://www.proximus.be/fr/id_cr_".concat(item.productCode);
                }
                return '';
            case 'voo':
                if (item.baseProductCode) {
                    return "https://hardware.mobile.voo.be/fr/handset/Smartphone/smartphone-medium-plus/".concat(item.baseProductCode, "/p/").concat(item.productId || '');
                }
                return '';
            case 'orange':
                if (item.productUrl) {
                    return item.productUrl;
                }
                return '';
            default:
                return '';
        }
    };
    SmartphoneSyncWorker.prototype.extractValue = function (item, mapping) {
        var _this = this;
        if (typeof mapping === 'string') {
            return item[mapping];
        }
        if (!mapping || !mapping.field) {
            return undefined;
        }
        var value = item[mapping.field];
        if (!mapping.transform)
            return value;
        var transforms = Array.isArray(mapping.transform) ? mapping.transform : [mapping.transform];
        return transforms.reduce(function (val, transform) {
            var transformer = _this.transformers[transform];
            return transformer ? transformer(val) : val;
        }, value);
    };
    SmartphoneSyncWorker.prototype.processVooData = function (vooData) {
        var vooPhones = new Map();
        if (vooData && Array.isArray(vooData)) {
            for (var _i = 0, vooData_1 = vooData; _i < vooData_1.length; _i++) {
                var item = vooData_1[_i];
                try {
                    if (!item.storage || !item.name)
                        continue;
                    var brand = this.normalizeBrand(item.brandName || item.name);
                    var model = this.cleanModel(item.name);
                    var storage = this.extractStorage(item.storage[0] || '0');
                    if (!brand || !model || !storage)
                        continue;
                    var id = this.generateId(brand, model, storage);
                    var upfrontPrice = {
                        price: this.transformPrice(item.price || 0),
                        condition: item.dataOption && item.optionPrice
                            ? "Avec ".concat(item.dataOption, " pour ").concat(item.optionPrice, "\u20AC/mois")
                            : '',
                        url: item.baseProductCode
                            ? "".concat(this.VOO_BASE_URL, "/fr/mobile/smartphones/").concat(item.baseProductCode)
                            : ''
                    };
                    if (vooPhones.has(id)) {
                        // Update existing phone with VOO pricing
                        var existingPhone = vooPhones.get(id);
                        existingPhone.upfrontPrices.voo = upfrontPrice;
                    }
                    else {
                        // Create new phone
                        var smartphone = {
                            id: id,
                            brand: brand,
                            model: model,
                            storage: storage,
                            imageUrl: '',
                            upfrontPrices: {
                                voo: upfrontPrice
                            }
                        };
                        vooPhones.set(id, smartphone);
                    }
                }
                catch (error) {
                    console.error('Error processing VOO item:', error);
                }
            }
        }
        return vooPhones;
    };
    SmartphoneSyncWorker.prototype.mergeSmartphones = function (proximusPhones, vooPhones, orangePhones) {
        return __awaiter(this, void 0, void 0, function () {
            var mergedPhones, _i, proximusPhones_1, _a, id, phone, _b, vooPhones_1, _c, id, vooPhone, existingPhone, _d, orangePhones_1, _e, id, orangePhone, existingPhone;
            return __generator(this, function (_f) {
                mergedPhones = new Map();
                // Process Proximus phones first (primary source)
                for (_i = 0, proximusPhones_1 = proximusPhones; _i < proximusPhones_1.length; _i++) {
                    _a = proximusPhones_1[_i], id = _a[0], phone = _a[1];
                    mergedPhones.set(id, phone);
                }
                // Merge VOO phones
                for (_b = 0, vooPhones_1 = vooPhones; _b < vooPhones_1.length; _b++) {
                    _c = vooPhones_1[_b], id = _c[0], vooPhone = _c[1];
                    if (mergedPhones.has(id)) {
                        existingPhone = mergedPhones.get(id);
                        existingPhone.upfrontPrices.voo = vooPhone.upfrontPrices.voo;
                    }
                    else {
                        // Add new VOO phone
                        mergedPhones.set(id, vooPhone);
                    }
                }
                // Merge Orange phones
                for (_d = 0, orangePhones_1 = orangePhones; _d < orangePhones_1.length; _d++) {
                    _e = orangePhones_1[_d], id = _e[0], orangePhone = _e[1];
                    if (mergedPhones.has(id)) {
                        existingPhone = mergedPhones.get(id);
                        existingPhone.upfrontPrices.orange = orangePhone.upfrontPrices.orange;
                    }
                    else {
                        // Add new Orange phone
                        mergedPhones.set(id, orangePhone);
                    }
                }
                // Convert to array and sort
                return [2 /*return*/, Array.from(mergedPhones.values()).sort(function (a, b) {
                        if (a.brand !== b.brand)
                            return a.brand.localeCompare(b.brand);
                        if (a.model !== b.model)
                            return a.model.localeCompare(b.model);
                        return a.storage - b.storage;
                    })];
            });
        });
    };
    SmartphoneSyncWorker.prototype.sync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, proximusData, vooData, orangeData, proximusPhones, vooPhones, orangePhones, proximusMap, vooMap, orangeMap, mergedPhones, sortedPhones, validPhones, error_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        console.log('Starting smartphone synchronization...');
                        return [4 /*yield*/, Promise.all([
                                this.fetchProximusData(),
                                this.fetchVooData(),
                                this.fetchOrangeData()
                            ])];
                    case 1:
                        _a = _b.sent(), proximusData = _a[0], vooData = _a[1], orangeData = _a[2];
                        return [4 /*yield*/, this.processProviderData('proximus', proximusData)];
                    case 2:
                        proximusPhones = _b.sent();
                        return [4 /*yield*/, this.processProviderData('voo', vooData)];
                    case 3:
                        vooPhones = _b.sent();
                        return [4 /*yield*/, this.processProviderData('orange', orangeData)];
                    case 4:
                        orangePhones = _b.sent();
                        proximusMap = new Map(proximusPhones.map(function (phone) { return [phone.id, phone]; }));
                        vooMap = new Map(vooPhones.map(function (phone) { return [phone.id, phone]; }));
                        orangeMap = new Map(orangePhones.map(function (phone) { return [phone.id, phone]; }));
                        return [4 /*yield*/, this.mergeSmartphones(proximusMap, vooMap, orangeMap)];
                    case 5:
                        mergedPhones = _b.sent();
                        sortedPhones = mergedPhones.sort(function (a, b) {
                            if (a.brand !== b.brand)
                                return a.brand.localeCompare(b.brand);
                            if (a.model !== b.model)
                                return a.model.localeCompare(b.model);
                            return a.storage - b.storage;
                        });
                        validPhones = sortedPhones.filter(function (phone) { return _this.validateSmartphone(phone); });
                        // Save to file
                        return [4 /*yield*/, promises_1.default.writeFile(path_1.default.join(process.cwd(), 'src/data/smartphones.json'), JSON.stringify(validPhones, null, 2), 'utf8')];
                    case 6:
                        // Save to file
                        _b.sent();
                        console.log("Successfully synchronized ".concat(validPhones.length, " smartphones"));
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _b.sent();
                        console.error('Error during smartphone synchronization:', error_1);
                        throw error_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    SmartphoneSyncWorker.prototype.validateSmartphone = function (phone) {
        if (!phone.id || !phone.brand || !phone.model || !phone.storage) {
            console.log('Invalid smartphone: missing required fields', phone);
            return false;
        }
        // Check if at least one provider has pricing information
        var hasValidPricing = Object.values(phone.upfrontPrices).some(function (price) { return price && typeof price.price === 'number' && price.price >= 0; });
        if (!hasValidPricing) {
            console.log('Invalid smartphone: no valid pricing information', phone);
            return false;
        }
        return true;
    };
    SmartphoneSyncWorker.prototype.fetchProximusData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dataPath, rawData, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        dataPath = path_1.default.join(this.dataPath, 'proximus.json');
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, promises_1.default.readFile(dataPath, 'utf-8')];
                    case 1:
                        rawData = _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/, rawData];
                }
            });
        });
    };
    SmartphoneSyncWorker.prototype.fetchVooData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dataPath, rawData, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        dataPath = path_1.default.join(this.dataPath, 'voo.json');
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, promises_1.default.readFile(dataPath, 'utf-8')];
                    case 1:
                        rawData = _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/, rawData];
                }
            });
        });
    };
    SmartphoneSyncWorker.prototype.fetchOrangeData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dataPath, rawData, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        dataPath = path_1.default.join(this.dataPath, 'orange.json');
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, promises_1.default.readFile(dataPath, 'utf-8')];
                    case 1:
                        rawData = _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/, rawData];
                }
            });
        });
    };
    return SmartphoneSyncWorker;
}());
exports.SmartphoneSyncWorker = SmartphoneSyncWorker;
if (require.main === module) {
    var worker = new SmartphoneSyncWorker();
    worker.sync().catch(console.error);
}
