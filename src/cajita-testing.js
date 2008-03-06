// generic "class"
function Point(x, y)
{
    return caja.freeze({
        toString: function() {
            return "<" + x + "," + y + ">";
        },
        getX: function() { return x; },
        getY: function() { return y; }
    });
}

// # "class" with inheritance/mixin
function PointMixin(that, x, y)
{
    that.toString = function() {
        return "<" + that.getX() + "," +
        that.getY() + ">";
    };
    that.getX = function() { return x; };
    that.getY = function() { return y; };
    return that;
}
function Point(x, y)
{
    return caja.freeze(PointMixin({}, x, y));
}
function WobblyPointMixin(that)
{
    var parent = caja.snapshot(that);
    that.getX = function() {
        return Math.random() + parent.getX();
    };
    return that;
}
function WobblyPoint(x, y)
{
    var that = PointMixin({}, x, y);
    that = WobblyPointMixin(that);
    return caja.freeze(that);
}

/* Caja Utils

    # General
        * caja.eval(str)
        * caja.forEach(obj, function(v,k) { ... })

    # Types
        * caja.enforceType(obj, typeName) -- assert typeName using typeof
        * caja.enforceNat(num) -- true if natural number [0 - Integer.MAX_INT]
        * caja.isJSONContainer(obj) -- true if Array || Simple Object
        * caja.isArray(obj)

    # Object Lifecycle
        * caja.freeze(obj)
        * caja.snapshot(obj) -- freezes a copy of obj and returns it
        * caja.copy(obj) -- makes a mutable copy of a JSON container (Obj|Array)

    # Inheritance
        * caja.def(derivedClass, superClass, objInstMembers[, objStaticMembers])

*/
