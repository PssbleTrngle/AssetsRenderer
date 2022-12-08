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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var canvas_1 = __importDefault(require("canvas"));
var fs_1 = require("fs");
var lodash_es_1 = require("lodash-es");
var node_canvas_webgl_1 = require("node-canvas-webgl");
var path_1 = require("path");
var three_1 = require("three");
var math_js_1 = require("./math.js");
var models_js_1 = require("./models.js");
var FACES = ['east', 'west', 'up', 'down', 'south', 'north'];
var BUILTIN = {
    display: {
        gui: {
            rotation: [-15, -90, 0],
            scale: [0.625, 0.625, 0.625],
            translation: [0, 0, 0],
        },
    },
    elements: [
        {
            from: [0, 0, 0],
            to: [16, 16, 16],
            faces: {
                up: { texture: '#layer0' },
                down: { texture: '#layer0' },
                north: { texture: '#layer0' },
                east: { texture: '#layer0' },
                south: { texture: '#layer0' },
                west: { texture: '#layer0' },
            },
        },
    ],
};
var ModelRenderer = /** @class */ (function () {
    function ModelRenderer(dir) {
        this.dir = dir;
        this.size = 512;
        this.distance = 15;
        this.scene = new three_1.Scene();
        this.camera = new three_1.OrthographicCamera(-this.distance, this.distance, this.distance, -this.distance, 0.01, 20000);
        this.canvas = (0, node_canvas_webgl_1.createCanvas)(this.size, this.size);
        this.renderer = new three_1.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
            logarithmicDepthBuffer: true,
        });
        var light = new three_1.DirectionalLight(0xffffff, 1.2);
        light.position.set(-15, 30, -25);
        this.scene.add(light);
        this.renderer.sortObjects = false;
    }
    ModelRenderer.prototype.getNamespaces = function () {
        var _this = this;
        return (0, fs_1.readdirSync)(this.dir).filter(function (it) { return (0, fs_1.statSync)((0, path_1.join)(_this.dir, it)).isDirectory(); });
    };
    ModelRenderer.prototype.getItems = function () {
        var _this = this;
        var namespaces = this.getNamespaces();
        return namespaces.flatMap(function (mod) {
            var dir = (0, path_1.join)(_this.dir, mod, 'models', 'item');
            if (!(0, fs_1.existsSync)(dir))
                return [];
            var models = (0, fs_1.readdirSync)(dir).filter(function (it) { return it.endsWith('.json'); });
            return models.map(function (file) { return ({ mod: mod, id: (0, path_1.parse)(file).name }); });
        });
    };
    ModelRenderer.prototype.getBlocks = function () {
        var _this = this;
        var namespaces = this.getNamespaces();
        return namespaces.flatMap(function (mod) {
            var dir = (0, path_1.join)(_this.dir, mod, 'blockstates');
            if (!(0, fs_1.existsSync)(dir))
                return [];
            var models = (0, fs_1.readdirSync)(dir).filter(function (it) { return it.endsWith('.json'); });
            return models.map(function (file) { return ({ mod: mod, id: (0, path_1.parse)(file).name }); });
        });
    };
    ModelRenderer.prototype.getBlockModel = function (block) {
        try {
            return this.getModel(block, 'item');
        }
        catch (_a) {
            return this.getModel(block, 'block');
        }
    };
    ModelRenderer.prototype.render = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var model, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        model = this.getBlockModel(block);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.renderModel(model)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        e_1 = _a.sent();
                        if (e_1 instanceof Error)
                            throw new Error("Error rendering ".concat((0, models_js_1.idOf)(block), ": ").concat(e_1.message));
                        else
                            throw e_1;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelRenderer.prototype.renderModel = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            var elements, display, gui, rotation;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        elements = model.elements, display = model.display;
                        gui = (display !== null && display !== void 0 ? display : {}).gui;
                        if (!gui)
                            throw new Error('No gui configuration');
                        if (!elements)
                            throw new Error('No elements');
                        this.camera.zoom = 1 / Math.sqrt(Math.pow(gui.scale[0], 2) + Math.pow(gui.scale[1], 2) + Math.pow(gui.scale[2], 2));
                        this.scene.clear();
                        return [4 /*yield*/, Promise.all(elements.map(function (element, i) { return __awaiter(_this, void 0, void 0, function () {
                                var calculatedSize, geometry, materials, cube;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            calculatedSize = (0, math_js_1.size)(element.from, element.to);
                                            geometry = new (three_1.BoxGeometry.bind.apply(three_1.BoxGeometry, __spreadArray(__spreadArray([void 0], calculatedSize, false), [1, 1, 1], false)))();
                                            return [4 /*yield*/, this.constructBlockMaterial(model, element)];
                                        case 1:
                                            materials = _a.sent();
                                            cube = new three_1.Mesh(geometry, materials);
                                            cube.position.set(0, 0, 0);
                                            cube.position.add(new (three_1.Vector3.bind.apply(three_1.Vector3, __spreadArray([void 0], element.from, false)))());
                                            cube.position.add(new (three_1.Vector3.bind.apply(three_1.Vector3, __spreadArray([void 0], element.to, false)))());
                                            cube.position.multiplyScalar(0.5);
                                            cube.position.add(new three_1.Vector3(-8, -8, -8));
                                            cube.renderOrder = i;
                                            this.scene.add(cube);
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        _b.sent();
                        rotation = new (three_1.Vector3.bind.apply(three_1.Vector3, __spreadArray([void 0], gui.rotation, false)))().add(new three_1.Vector3(195, -90, -45));
                        (_a = this.camera.position).set.apply(_a, rotation.toArray().map(function (x) { return Math.sin(x * three_1.MathUtils.DEG2RAD) * 16; }));
                        this.camera.lookAt(0, 0, 0);
                        this.camera.position.add(new (three_1.Vector3.bind.apply(three_1.Vector3, __spreadArray([void 0], gui.translation, false)))());
                        this.camera.updateMatrix();
                        this.camera.updateProjectionMatrix();
                        this.renderer.render(this.scene, this.camera);
                        return [2 /*return*/, this.canvas.toBuffer()];
                }
            });
        });
    };
    ModelRenderer.prototype.modelPath = function (_a, type) {
        var id = _a.id, mod = _a.mod;
        var path = id.includes('/') ? id : "".concat(type, "/").concat(id);
        return (0, path_1.join)(this.dir, mod !== null && mod !== void 0 ? mod : 'minecraft', 'models', "".concat(path, ".json"));
    };
    ModelRenderer.prototype.keyFrom = function (key) {
        if (!key.includes(':'))
            return { mod: 'minecraft', id: key };
        var _a = key.split(':'), mod = _a[0], id = _a[1];
        return { mod: mod, id: id };
    };
    ModelRenderer.prototype.getModel = function (block, type) {
        var path = this.modelPath(block, type);
        if (!(0, fs_1.existsSync)(path))
            throw new Error("Could not find model for ".concat((0, models_js_1.idOf)(block)));
        var raw = (0, fs_1.readFileSync)(path).toString();
        var parsed = JSON.parse(raw);
        if (parsed.parent) {
            if (parsed.parent.includes('builtin'))
                (0, lodash_es_1.merge)(parsed, BUILTIN);
            else
                (0, lodash_es_1.merge)(parsed, this.getModel(this.keyFrom(parsed.parent), type));
        }
        return parsed;
    };
    ModelRenderer.prototype.getTexture = function (_a) {
        var mod = _a.mod, id = _a.id;
        return __awaiter(this, void 0, void 0, function () {
            var path;
            return __generator(this, function (_b) {
                path = (0, path_1.join)(this.dir, mod !== null && mod !== void 0 ? mod : 'minecraft', 'textures', "".concat(id, ".png"));
                return [2 /*return*/, (0, fs_1.readFileSync)(path)];
            });
        });
    };
    ModelRenderer.prototype.getMetadata = function (_a) {
        var mod = _a.mod, id = _a.id;
        return __awaiter(this, void 0, void 0, function () {
            var path, raw;
            return __generator(this, function (_b) {
                path = (0, path_1.join)(this.dir, mod !== null && mod !== void 0 ? mod : 'minecraft', 'textures', "".concat(id, ".png.mcmeta"));
                if (!(0, fs_1.existsSync)(path))
                    return [2 /*return*/, null];
                raw = (0, fs_1.readFileSync)(path).toString();
                return [2 /*return*/, JSON.parse(raw)];
            });
        });
    };
    ModelRenderer.prototype.decodeFace = function (face, block) {
        return __awaiter(this, void 0, void 0, function () {
            var decodedTexture;
            return __generator(this, function (_a) {
                decodedTexture = this.decodeTexture(face.texture, block);
                if (!decodedTexture)
                    return [2 /*return*/, null];
                return [2 /*return*/, this.constructTextureMaterial(block, decodedTexture, face)];
            });
        });
    };
    ModelRenderer.prototype.constructBlockMaterial = function (block, element) {
        return __awaiter(this, void 0, void 0, function () {
            var materials;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(element === null || element === void 0 ? void 0 : element.faces))
                            return [2 /*return*/, []];
                        return [4 /*yield*/, Promise.all(FACES.map(function (direction) {
                                var _a;
                                var face = (_a = element === null || element === void 0 ? void 0 : element.faces) === null || _a === void 0 ? void 0 : _a[direction];
                                if (!face)
                                    return null;
                                return _this.decodeFace(face, block);
                            }))];
                    case 1:
                        materials = _a.sent();
                        return [2 /*return*/, materials];
                }
            });
        });
    };
    ModelRenderer.prototype.decodeTexture = function (texture, block) {
        var _a;
        if (!texture)
            return null;
        if (!texture.startsWith('#'))
            return texture;
        var correctedTextureName = (_a = block.textures) === null || _a === void 0 ? void 0 : _a[texture.substring(1)];
        if (!correctedTextureName)
            return null;
        return this.decodeTexture(correctedTextureName, block);
    };
    ModelRenderer.prototype.constructTextureMaterial = function (block, path, face) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var image, _b, animationMeta, width, height, canvas, ctx, uv, texture;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = node_canvas_webgl_1.loadImage;
                        return [4 /*yield*/, this.getTexture(this.keyFrom(path))];
                    case 1: return [4 /*yield*/, _b.apply(void 0, [_c.sent()])];
                    case 2:
                        image = _c.sent();
                        return [4 /*yield*/, this.getMetadata(this.keyFrom(path))];
                    case 3:
                        animationMeta = _c.sent();
                        width = image.width;
                        height = animationMeta ? width : image.height;
                        canvas = canvas_1.default.createCanvas(width, height);
                        ctx = canvas.getContext('2d');
                        ctx.imageSmoothingEnabled = false;
                        if (face.rotation) {
                            ctx.translate(width / 2, height / 2);
                            ctx.rotate(face.rotation * three_1.MathUtils.DEG2RAD);
                            ctx.translate(-width / 2, -height / 2);
                        }
                        uv = (_a = face.uv) !== null && _a !== void 0 ? _a : [0, 0, width, height];
                        ctx.drawImage(image, uv[0], uv[1], uv[2] - uv[0], uv[3] - uv[1], 0, 0, width, height);
                        texture = new three_1.Texture(canvas);
                        texture.magFilter = three_1.NearestFilter;
                        texture.minFilter = three_1.NearestFilter;
                        texture.needsUpdate = true;
                        return [2 /*return*/, new three_1.MeshBasicMaterial({
                                map: texture,
                                //color: 0xffffff,
                                transparent: true,
                                //roughness: 1,
                                //metalness: 0,
                                //emissive: 1,
                                alphaTest: 0.1,
                            })];
                }
            });
        });
    };
    return ModelRenderer;
}());
exports.default = ModelRenderer;
