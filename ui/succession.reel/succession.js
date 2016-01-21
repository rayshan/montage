"use strict";

/**
 * @module "montage/ui/succession.reel"
 */
var Component = require("ui/component").Component;

/**
 * Subclasses Component for its `domContent` behavior.
 *
 * If passage properties are defined on the Succession, they will override children's.
 * See {@link Succession#_prepareForBuild}.
 *
 * @class Succession
 * @augments Component
 */
exports.Succession = Component.specialize(/** @lends Succession.prototype */{

    contentBuildInAnimation: {
        value: null
    },

    contentBuildOutAnimation: {
        value: null
    },

    constructor: {
        value: function () {
            this.defineBindings({
                /**
                 * The top Passage of the Succession stack.
                 * It is coerce to `null` as `undefined` causes issues with `Slot`.
                 *
                 * @property {Passage} top
                 * @readonly
                 * @namespace Succession
                 */
                "top": {"<-": "this.content[this.content.length - 1]"},
                /**
                 * The Passage immediately below the top of Succession stack.
                 *
                 * @property {Passage} previous
                 * @readonly
                 * @namespace Succession
                 */
                "previous": {"<-": "this.content[this.content.length - 2]"},
                /**
                 * The beginning Passage of the Succession stack.
                 *
                 * @property {Passage} first
                 * @readonly
                 * @namespace Succession
                 */
                "first": {"<-": "this.content[0]"}
            });
        }
    },

    _content: {
        value: null
    },

    /**
     * A stack consisted of {@link Passage}s.
     *
     * @property {Array}
     */
    content: {
        get: function () {
            return this._content || (this._content = []);
        },
        set: function (value) {
            if (this.content && this.content.length) {
                this._prepareForBuild();
                this.content.length = 0;
            }
            if (value) {
                this.push(value);
            } else {
                this.domContent = null;
            }
        }
    },

    /**
     * @property {boolean}
     * @default false
     */
    hasTemplate: {
        enumerable: false,
        value: false
    },

    /**
     * Push a new Passage onto the Stack.
     * If a Component is supplied, a Passage will be created based on what's currently on the stack.
     *
     * @function
     * @param {Passage|Component} value
     */
    push: {
        value: function (value) {
            var element;

            // Push may happen when Succession hasn't enterDocument yet
            if (this.parentComponent) {
                this._prepareForBuild(value);
            }

            this.content.push(value);
            this._updateDomContent();
        }
    },

    /**
     * Pop off the topmost Passage on the Stack.
     *
     * @function
     */
    pop: {
        value: function () {
            if (this.top) {
                var restore = this.top;

                this._prepareForBuild(this.previous);
                this.content.pop();

                if (this.content.length) {
                    this._updateDomContent();
                } else {
                    this.domContent = null;
                }
            }
        }
    },

    /**
     * Override build-in / out animation; checks for whether properties are undefined,
     * as null is used to disable passage animation.
     *
     * Priority from most important: Succession -> Passage -> Component
     *
     * @function
     * @private
     */
    _prepareForBuild: {
        value: function (incoming) {
            if (incoming) {
                incoming.buildInAnimationOverride = this.contentBuildInAnimation;
                incoming.buildOutAnimationOverride = this.contentBuildOutAnimation;
            }
            if (this.top) {
                this.top.buildInAnimationOverride = this.contentBuildInAnimation;
                this.top.buildOutAnimationOverride = this.contentBuildOutAnimation;
            }
        }
    },

    /**
     * Ensure components generated by instantiating in JavaScript instead of
     * declaring in template serialization has an element.
     *
     * @function
     * @private
     */
    _updateDomContent: {
        value: function () {
            var element;

            if (!this.top.element) {
                element = document.createElement("div");
                element.id = this.top.identifier || "appendDiv";
                this.top.element = element;

            } else {
                element = this.top.element;
            }

            this.domContent = element;
            this.top.needsDraw = true;
        }
    }
});