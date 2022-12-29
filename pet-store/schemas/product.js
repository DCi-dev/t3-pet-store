export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'image',
      title: 'Image',
      type: 'array',
      of: [{type: 'image'}],
      options: {
        hotspot: true,
      },
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      initialValue: 'cat',
      options: {
        list: [
          {title: 'Cat', value: 'cat'},
          {title: 'Dog', value: 'dog'},
        ],
      },
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
    },
    {
      name: 'size',
      title: 'Size',
      type: 'string',
      initialValue: 'small',
      options: {
        list: [
          {title: 'Small', value: 'small'},
          {title: 'Medium', value: 'medium'},
          {title: 'Large', value: 'large'},
        ],
      },
    },
    {
      name: 'flavor',
      title: 'Flavor',
      type: 'array',
      of: [
        {
          type: 'string',
          options: {
            list: [
              {title: 'Chicken', value: 'chicken'},
              {title: 'Beef', value: 'beef'},
              {title: 'Salmon', value: 'salmon'},
              {title: 'Turkey', value: 'turkey'},
              {title: 'Lamb', value: 'lamb'},
            ],
          },
        },
      ],
    },
  ],
}
