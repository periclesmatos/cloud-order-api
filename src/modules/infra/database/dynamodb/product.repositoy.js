
import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
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

  async findByName(name, filters = {}) {
    const nameNormalized = ProductDynamoDBMapper.normalizeName(name);
    if (!nameNormalized) return [];

    const filterConditions = ['#type = :type', 'contains(#nameNormalized, :nameNormalized)'];
    const expressionAttributeNames = {
      '#type': 'type',
      '#nameNormalized': 'nameNormalized',
    };
    const expressionAttributeValues = {
      ':type': 'PRODUCT',
      ':nameNormalized': nameNormalized,
    };

    if (filters.isActive !== undefined) {
      filterConditions.push('#isActive = :isActive');
      expressionAttributeNames['#isActive'] = 'isActive';
      expressionAttributeValues[':isActive'] = filters.isActive;
    }

    const result = await dynamodb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: filterConditions.join(' AND '),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      }),
    );

    return (result.Items ?? []).map(ProductDynamoDBMapper.toDomainProduct);
  }

  async findAll(filters = {}) {
    const filterConditions = ['#type = :type'];
    const expressionAttributeNames = {
      '#type': 'type',
    };
    const expressionAttributeValues = {
      ':type': 'PRODUCT',
    };

    if (filters.isActive !== undefined) {
      filterConditions.push('#isActive = :isActive');
      expressionAttributeNames['#isActive'] = 'isActive';
      expressionAttributeValues[':isActive'] = filters.isActive;
    }

    const result = await dynamodb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: filterConditions.join(' AND '),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      }),
    );

    return (result.Items ?? []).map(ProductDynamoDBMapper.toDomainProduct);
  }

  async update(product) {
    const productItem = ProductDynamoDBMapper.toProductItem(product);

    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: productItem,
        ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
      }),
    );

    return product;
  }

  async deleteById(productId) {
    await dynamodb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `PRODUCT#${productId}`,
          SK: 'PROFILE',
        },
        ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
      }),
    );
  }
}
