class ScoreSerializer < ActiveModel::Serializer
  attributes :id, :score, :user_id
end
