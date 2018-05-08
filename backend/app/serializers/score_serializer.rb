class ScoreSerializer < ActiveModel::Serializer
  attributes :id, :user_score, :user_id
end
