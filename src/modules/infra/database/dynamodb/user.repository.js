import { QueryCommand, ScanCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { dynamodb, TABLE_NAME } from './dynamo-client.js';
import { toDomainUser, toEmailLockItem, toUserItem } from './mappers/user.mapper.js';

export class UserDynamoDBRepository {
  async saveUser(user) {
    const userItem = toUserItem(user);
    const emailLock = toEmailLockItem(user);

    try {
      await dynamodb.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: TABLE_NAME,
                Item: userItem,
                ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
              },
            },
            {
              Put: {
                TableName: TABLE_NAME,
                Item: emailLock,
                ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
              },
            },
          ],
        }),
      );

      return user;
    } catch (error) {
      if (error.name === 'TransactionCanceledException') {
        throw new ValidationError('E-mail já cadastrado para outro usuário');
      }
      throw error;
    }
  }

  async findById(userId) {
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
        },
        Limit: 1,
      }),
    );

    const userItem = result.Items?.find((item) => item.SK === 'PROFILE');
    return toDomainUser(userItem);
  }

  async findByEmail(email) {
    const lockResult = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `EMAIL#${email}`,
        },
        Limit: 1,
      }),
    );

    const lockItem = lockResult.Items?.[0];
    if (!lockItem) return null;

    return this.findById(lockItem.userId);
  }

  async findAll() {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: '#type = :type',
        ExpressionAttributeNames: {
          '#type': 'type',
        },
        ExpressionAttributeValues: {
          ':type': 'USER',
        },
      }),
    );

    return (result.Items ?? []).map(toDomainUser);
  }
}
