
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLE_NAME } from './dynamo-client.js';
import { ProductDynamoDBMapper } from './mappers/product.mapper.js';

export class ProductDynamoDBRepository {
  async saveProduct(product) {
    const productItem = ProductDynamoDBMapper.toProductItem(product);
    const params = {
      TableName: TABLE_NAME,
      Item: productItem,
    };
    await dynamodb.send(new PutCommand(params));
    return product;
  }

  async findById(productId) {
    const result = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `PRODUCT#${productId}`,
          SK: 'PROFILE',
        },
      }),
    );
    if (!result.Item) return null;
    return ProductDynamoDBMapper.toDomainProduct(result.Item);
  }

  async findByName(name) {
    const nameNormalized = ProductDynamoDBMapper.normalizeName(name);
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'type-index',
        KeyConditionExpression: '#type = :type',
        FilterExpression: '#nameNormalized = :nameNormalized',
        ExpressionAttributeNames: {
          '#type': 'type',
          '#nameNormalized': 'nameNormalized',
        },
        ExpressionAttributeValues: {
          ':type': 'PRODUCT',
          ':nameNormalized': nameNormalized,
        },
      }),
    );

    return (result.Items ?? []).map(ProductDynamoDBMapper.toDomainProduct);
  }

  async findAll() {
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'type-index',
        KeyConditionExpression: '#type = :type',
        ExpressionAttributeNames: {
          '#type': 'type',
        },
        ExpressionAttributeValues: {
          ':type': 'PRODUCT',
        },
      }),
    );

    return (result.Items ?? []).map(ProductDynamoDBMapper.toDomainProduct);
  }
}
