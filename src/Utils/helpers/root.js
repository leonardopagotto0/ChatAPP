module.exports = 
{
    ifEqual: function (v1, v2, options){
        if(v1 == v2) {
            return options.fn(this);
          }
        return options.inverse(this);
    },
    ifDifferent: function (v1, v2, options){
        if(v1 != v2) {
            return options.fn(this);
          }
        return options.inverse(this);
    }
}