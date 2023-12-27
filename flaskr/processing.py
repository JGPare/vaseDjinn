
def string_dict_to_int_dict(data):
  for key in data.keys():
    value = data[key]
    if type(value) == list:
        for elem in value:
            for subkey in elem.keys():
                elem[subkey] = int(elem[subkey])
    else:
        for subkey in value.keys():
            value[subkey] = int(value[subkey])
  return data