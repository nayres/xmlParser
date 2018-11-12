module.exports = function(tagname, parent, val) {
    this.tagname = tagname;
    this.parent = parent;
    this.child = {};
    this.attrsMap = {};
    this.val = val;
    this.addChild = function(child) {
        if (this.child[child.tagname]) {
            this.child[child.tagname].push(child);
        } else {
            this.child[child.tagname] = [child];
        }
    };
}
