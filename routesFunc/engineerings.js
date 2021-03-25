const itemMerge = (data, newAttr, attr1, attr2) => {
  data.forEach((value) => {
    value[newAttr] = `${value[attr1]}(${value[attr2]})`;
  });
  return data;
};
module.exports = {itemMerge};